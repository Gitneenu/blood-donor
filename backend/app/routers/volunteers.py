from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.models.schemas import VolunteerCreate, Volunteer

router = APIRouter(prefix="/volunteers", tags=["volunteers"])


@router.post("", response_model=Volunteer)
def create_volunteer(payload: VolunteerCreate):
    res = supabase.table("volunteers").insert(payload.model_dump()).execute()
    if not res.data:
        raise HTTPException(500, "Failed to create volunteer")
    return res.data[0]


@router.get("", response_model=list[Volunteer])
def list_volunteers():
    res = supabase.table("volunteers").select("*").order("created_at", desc=True).execute()
    return res.data
