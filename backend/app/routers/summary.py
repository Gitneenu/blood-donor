from fastapi import APIRouter
from app.database import supabase

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("")
def get_summary():
    """
    Overall dashboard numbers:
      - successful donations (donations.status = completed)
      - unsuccessful donations (donations.status = failed)
      - pending donations (broadcast/added but not yet resolved)
      - requests fully completed vs still open vs cancelled
    """
    donations = supabase.table("donations").select("status").execute().data
    requests = supabase.table("blood_requests").select("status,units_needed,units_received").execute().data

    donation_counts = {"completed": 0, "failed": 0, "pending": 0}
    for d in donations:
        donation_counts[d["status"]] = donation_counts.get(d["status"], 0) + 1

    request_counts = {"open": 0, "completed": 0, "cancelled": 0}
    for r in requests:
        request_counts[r["status"]] = request_counts.get(r["status"], 0) + 1

    total_units_needed = sum(r["units_needed"] for r in requests)
    total_units_received = sum(r["units_received"] for r in requests)

    return {
        "donations": {
            "successful": donation_counts["completed"],
            "unsuccessful": donation_counts["failed"],
            "pending": donation_counts["pending"],
            "total": len(donations),
        },
        "requests": {
            "open": request_counts["open"],
            "completed": request_counts["completed"],
            "cancelled": request_counts["cancelled"],
            "total": len(requests),
        },
        "units": {
            "needed": total_units_needed,
            "received": total_units_received,
        },
    }
