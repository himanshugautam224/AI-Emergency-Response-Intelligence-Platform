"""ML Risk Prediction API route."""
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class RiskPredictionRequest(BaseModel):
    disaster_type: str = "flood"
    affected_population: int = 10000
    latitude: float = 20.5937
    longitude: float = 78.9629
    district: str = ""
    state: str = ""
    rainfall_mm: Optional[float] = None
    wind_speed: Optional[float] = None
    magnitude: Optional[float] = None


@router.post("/predict")
async def predict_risk(request: RiskPredictionRequest):
    """Run ML risk prediction for a given disaster scenario."""
    from ml.risk_prediction.predict import predict_risk as ml_predict

    result = ml_predict({
        "disaster_type": request.disaster_type,
        "affected_population": request.affected_population,
        "latitude": request.latitude,
        "longitude": request.longitude,
        "rainfall_mm": request.rainfall_mm or 0,
        "wind_speed": request.wind_speed or 0,
        "magnitude": request.magnitude or 0,
    })
    return result


@router.get("/summary")
async def risk_summary():
    """Get risk summary across all districts."""
    from ml.risk_prediction.predict import get_risk_summary
    return get_risk_summary()


@router.get("/heatmap")
async def risk_heatmap():
    """Get heatmap data for map overlay."""
    from ml.risk_prediction.predict import get_heatmap_data
    return get_heatmap_data()
