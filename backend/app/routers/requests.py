from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.models.schemas import RequestCreate, BloodRequest, EligibleDonor

router = APIRouter(prefix="/requests", tags=["requests"])


@router.post("", response_model=BloodRequest)
def create_request(payload: RequestCreate):
    """Volunteer raises a blood request for a patient."""
    data = payload.model_dump()
    data["units_received"] = 0
    data["status"] = "open"
    res = supabase.table("blood_requests").insert(data).execute()
    if not res.data:
        raise HTTPException(500, "Failed to create request")
    return res.data[0]


@router.get("", response_model=list[BloodRequest])
def list_requests(status: str | None = None):
    q = supabase.table("blood_requests").select("*")
    if status:
        q = q.eq("status", status)
    res = q.order("created_at", desc=True).execute()
    return res.data


@router.get("/{request_id}", response_model=BloodRequest)
def get_request(request_id: str):
    res = supabase.table("blood_requests").select("*").eq("id", request_id).single().execute()
    if not res.data:
        raise HTTPException(404, "Request not found")
    return res.data


@router.get("/{request_id}/eligible-donors", response_model=list[EligibleDonor])
def eligible_donors(request_id: str):
    """
    Eligible donors for a request:
      - same blood group
      - available = true
      - >= 90 days since last donation (or never donated)
      - not already committed/donated for THIS request
    (Currently sorted oldest-registered-first. Swap in distance-based
    sorting later by adding lat/lng columns and a haversine order-by
    inside get_eligible_donors() in the SQL.)
    """
    req = supabase.table("blood_requests").select("id,status").eq("id", request_id).single().execute()
    if not req.data:
        raise HTTPException(404, "Request not found")

    res = supabase.rpc("get_eligible_donors", {"p_request_id": request_id}).execute()
    return res.data


@router.post("/{request_id}/broadcast")
def broadcast_to_donors(request_id: str):
    """
    Send the request to ALL currently-eligible donors at once.
    "Sending" here means:
      1. Insert a row per donor into `broadcasts` (audit trail - who got
         notified, and stops duplicate broadcasts).
      2. Create a `pending` donation record per donor - this moves them
         from "eligible" to "awaiting response" and keeps them out of
         the eligible list on a re-broadcast (see get_eligible_donors,
         which excludes donors with an existing pending/completed row).

    Swap the notify_donors() call for a real SMS/push/WhatsApp integration
    (e.g. Twilio) - the rest of the flow stays the same either way.
    """
    req = supabase.table("blood_requests").select("*").eq("id", request_id).single().execute()
    if not req.data:
        raise HTTPException(404, "Request not found")
    if req.data["status"] != "open":
        raise HTTPException(400, "Request is not open")

    eligible = supabase.rpc("get_eligible_donors", {"p_request_id": request_id}).execute().data
    if not eligible:
        return {"broadcast_count": 0, "message": "No eligible donors found right now."}

    donor_ids = [d["donor_id"] for d in eligible]

    broadcast_rows = [{"request_id": request_id, "donor_id": did} for did in donor_ids]
    supabase.table("broadcasts").upsert(broadcast_rows, on_conflict="request_id,donor_id").execute()

    donation_rows = [{"request_id": request_id, "donor_id": did, "status": "pending"} for did in donor_ids]
    supabase.table("donations").insert(donation_rows).execute()

    notify_donors(donor_ids, req.data)

    return {"broadcast_count": len(donor_ids), "donor_ids": donor_ids}


def notify_donors(donor_ids: list[str], request_row: dict):
    """
    Placeholder for the actual notification channel.
    Replace this with e.g.:
      - Twilio SMS to donor.phone
      - Supabase Realtime broadcast that the React app subscribes to
      - Push notification via FCM
    Kept as a no-op here so the endpoint stays fast and dependency-free.
    """
    pass


@router.post("/{request_id}/cancel", response_model=BloodRequest)
def cancel_request(request_id: str):
    res = supabase.table("blood_requests").update({"status": "cancelled"}).eq("id", request_id).execute()
    if not res.data:
        raise HTTPException(404, "Request not found")
    return res.data[0]
