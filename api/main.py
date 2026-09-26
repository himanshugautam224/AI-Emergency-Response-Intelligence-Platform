"""
AI Emergency Response Platform — FastAPI Backend
Main application entry point
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routes import disasters, incidents, risk, resources, weather, chatbot, optimization, triage
from database.connection import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and ML models on startup."""
    print("[ERIP] Starting AI Emergency Response Platform API...")
    init_db()
    print("[ERIP] Database initialized.")
    yield
    print("[ERIP] Shutting down...")


app = FastAPI(
    title="AI Emergency Response Intelligence Platform",
    description="Real-time disaster management, ML risk prediction, and resource optimization API",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://ai-emergency-response-intelligence-nine.vercel.app",
    "https://ai-emergency-response-intelligence-platform-f49m-lm9msvoih.vercel.app",
  ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ──────────────────────────────────────────────────────────────────
app.include_router(disasters.router, prefix="/api/disasters", tags=["Disasters"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(risk.router, prefix="/api/risk", tags=["ML Risk"])
app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
app.include_router(weather.router, prefix="/api/weather", tags=["External Feeds"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["AI Chatbot"])
app.include_router(optimization.router, prefix="/api/optimization", tags=["Optimization"])
app.include_router(triage.router, prefix="/api/triage", tags=["NLP Triage"])


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "platform": "AI Emergency Response Intelligence Platform"
    }


@app.get("/api/stats")
async def get_platform_stats():
    """High-level platform statistics for the dashboard."""
    from database.connection import get_db_session
    from database.models.incident import Incident
    from database.models.resource import Resource
    from sqlalchemy import func

    with get_db_session() as db:
        total_incidents = db.query(func.count(Incident.id)).scalar() or 0
        active_incidents = db.query(func.count(Incident.id)).filter(
            Incident.status.in_(["active", "responding"])
        ).scalar() or 0
        sos_reports = db.query(func.count(Incident.id)).filter(
            Incident.status == "sos"
        ).scalar() or 0
        total_resources = db.query(func.count(Resource.id)).scalar() or 0
        deployed_resources = db.query(func.count(Resource.id)).filter(
            Resource.status == "deployed"
        ).scalar() or 0

    return {
        "total_incidents": total_incidents,
        "active_incidents": active_incidents,
        "total_resources": total_resources,
        "deployed_resources": deployed_resources,
        "sos_reports": sos_reports,
        # volunteers_active, alerts_sent_today, districts_covered require
        # dedicated DB tables — omit rather than fabricate
    }
