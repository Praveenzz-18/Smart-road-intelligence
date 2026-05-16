from pydantic import BaseModel
from typing import List, Optional

class RouteLogCreate(BaseModel):
    source_lat: float
    source_lon: float
    dest_lat: float
    dest_lon: float
    source_name: str
    dest_name: str
    safety_score: int
    potholes_avoided: int
    is_safer_route_chosen: bool
    distance_km: Optional[float] = None

class RouteLogResponse(RouteLogCreate):
    id: str
    created_at: str

    class Config:
        from_attributes = True
