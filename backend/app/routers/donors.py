from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.models.schemas import DonorCreate, DonorUpdate, Donor

router = APIRouter(prefix="/donors", tags=["donors"])


@router.post("", response_model=Donor)
def register_donor(payload: DonorCreate):
    """Volunteer registers a new donor."""
    res = supabase.table("donors").insert(payload.model_dump()).execute()
    if not res.data:
        raise HTTPException(500, "Failed to register donor")
    return res.data[0]


@router.get("", response_model=list[Donor])
def list_donors(blood_group: str | None = None, available: bool | None = None):
    q = supabase.table("donors").select("*")
    if blood_group:
        q = q.eq("blood_group", blood_group)
    if available is not None:
        q = q.eq("available", available)
    res = q.order("created_at", desc=True).execute()
    return res.data


@router.get("/{donor_id}", response_model=Donor)
def get_donor(donor_id: str):
    res = supabase.table("donors").select("*").eq("id", donor_id).single().execute()
    if not res.data:
        raise HTTPException(404, "Donor not found")
    return res.data


@router.patch("/{donor_id}", response_model=Donor)
def update_donor(donor_id: str, payload: DonorUpdate):
    """Donor toggles availability."""
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "No fields to update")
    res = supabase.table("donors").update(updates).eq("id", donor_id).execute()
    if not res.data:
        raise HTTPException(404, "Donor not found")
    return res.data[0]
