from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime

class EventBase(BaseModel):
    event_type: Literal["pothole", "speed_breaker", "crash"]
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    severity: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    vehicle_id: str
    timestamp: datetime
    acceleration_x: Optional[float] = None
    acceleration_y: Optional[float] = None
    acceleration_z: Optional[float] = None
    image_url: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: str
    priority: Optional[str] = None
    
    class Config:
        from_attributes = True
