from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.models.schemas import DonationCreate, DonationStatusUpdate

router = APIRouter(prefix="/requests/{request_id}/donations", tags=["donations"])


@router.post("")
def add_donor_to_request(request_id: str, payload: DonationCreate):
    """
    Manually add a single donor to a request (as an alternative to
    broadcasting to everyone) - e.g. volunteer calls one donor directly.
    Creates a 'pending' donation record.
    """
    req = supabase.table("blood_requests").select("status").eq("id", request_id).single().execute()
    if not req.data:
        raise HTTPException(404, "Request not found")
    if req.data["status"] != "open":
        raise HTTPException(400, "Request is not open")

    existing = (
        supabase.table("donations")
        .select("id")
        .eq("request_id", request_id)
        .eq("donor_id", payload.donor_id)
        .in_("status", ["pending", "completed"])
        .execute()
    )
    if existing.data:
        raise HTTPException(400, "Donor already linked to this request")

    res = (
        supabase.table("donations")
        .insert({"request_id": request_id, "donor_id": payload.donor_id, "status": "pending"})
        .execute()
    )
    return res.data[0]


@router.get("")
def list_donations_for_request(request_id: str):
    """All donation records (pending/completed/failed) tied to a request,
    with donor details joined in - used to render 'X needed more, Y received'."""
    res = (
        supabase.table("donations")
        .select("*, donors(name, phone, blood_group)")
        .eq("request_id", request_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.patch("/{donation_id}")
def update_donation_status(request_id: str, donation_id: str, payload: DonationStatusUpdate):
    """
    Mark a specific donor's donation as 'completed' or 'failed'.

    On 'completed':
      - donor.available -> false, donor.last_donation_date -> now()
        (starts their 90-day cooldown)
      - request.units_received += 1
      - if units_received >= units_needed -> request.status = 'completed'

    On 'failed':
      - donor stays available; request stays open so more donors can
        be broadcast to / added.
    """
    donation = (
        supabase.table("donations")
        .select("*")
        .eq("id", donation_id)
        .eq("request_id", request_id)
        .single()
        .execute()
    )
    if not donation.data:
        raise HTTPException(404, "Donation record not found")
    if donation.data["status"] != "pending":
        raise HTTPException(400, f"Donation already marked as {donation.data['status']}")

    now = datetime.now(timezone.utc).isoformat()

    if payload.status == "completed":
        supabase.table("donations").update(
            {"status": "completed", "donated_at": now}
        ).eq("id", donation_id).execute()

        supabase.table("donors").update(
            {"available": False, "last_donation_date": now}
        ).eq("id", donation.data["donor_id"]).execute()

        req = (
            supabase.table("blood_requests")
            .select("units_needed, units_received")
            .eq("id", request_id)
            .single()
            .execute()
            .data
        )
        new_received = req["units_received"] + 1
        update_fields = {"units_received": new_received}
        if new_received >= req["units_needed"]:
            update_fields["status"] = "completed"
            update_fields["completed_at"] = now
        supabase.table("blood_requests").update(update_fields).eq("id", request_id).execute()

    else:  # failed
        supabase.table("donations").update({"status": "failed"}).eq("id", donation_id).execute()

    updated_request = supabase.table("blood_requests").select("*").eq("id", request_id).single().execute().data
    return {"donation_status": payload.status, "request": updated_request}
