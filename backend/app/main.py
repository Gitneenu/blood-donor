from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import donors, volunteers, requests, donations, summary

app = FastAPI(title="Blood Donation Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # add your deployed frontend URL too
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(volunteers.router)
app.include_router(donors.router)
app.include_router(requests.router)
app.include_router(donations.router)
app.include_router(summary.router)


@app.get("/")
def health():
    return {"status": "ok"}
