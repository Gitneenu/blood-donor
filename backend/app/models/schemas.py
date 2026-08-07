from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

BloodGroup = Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]


# ---------------- Volunteers ----------------
class VolunteerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None


class Volunteer(VolunteerCreate):
    id: str
    created_at: datetime


# ---------------- Donors ----------------
class DonorCreate(BaseModel):
    name: str
    phone: str
    blood_group: BloodGroup
    place: Optional[str] = None          # free-text area/city
    registered_by: Optional[str] = None  # volunteer_id


class DonorUpdate(BaseModel):
    available: Optional[bool] = None
    place: Optional[str] = None


class Donor(BaseModel):
    id: str
    name: str
    phone: str
    blood_group: BloodGroup
    place: Optional[str] = None
    available: bool
    last_donation_date: Optional[datetime] = None
    created_at: datetime


# ---------------- Requests ----------------
class RequestCreate(BaseModel):
    volunteer_id: str
    patient_name: str
    blood_group: BloodGroup
    units_needed: int = Field(gt=0, default=1)
    hospital: Optional[str] = None


class BloodRequest(BaseModel):
    id: str
    volunteer_id: Optional[str]
    patient_name: str
    blood_group: BloodGroup
    units_needed: int
    units_received: int
    hospital: Optional[str] = None
    status: Literal["open", "completed", "cancelled"]
    created_at: datetime
    completed_at: Optional[datetime] = None


class EligibleDonor(BaseModel):
    donor_id: str
    name: str
    phone: str
    blood_group: BloodGroup
    place: Optional[str] = None
    already_broadcast: bool


# ---------------- Donations ----------------
class DonationCreate(BaseModel):
    donor_id: str


class DonationStatusUpdate(BaseModel):
    status: Literal["completed", "failed"]
