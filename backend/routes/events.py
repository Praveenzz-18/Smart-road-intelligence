from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from typing import List, Optional
from schemas.event import EventCreate, EventResponse
from services.supabase_service import SupabaseService, get_supabase_service
import uuid

router = APIRouter(prefix="/events", tags=["Events"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/", response_model=EventResponse)
async def create_event(
    event: EventCreate, 
    service: SupabaseService = Depends(get_supabase_service)
):
    try:
        # Convert Pydantic model to dict for Supabase
        event_dict = event.model_dump()
        event_dict["timestamp"] = event.timestamp.isoformat()
        
        inserted_data = service.insert_event(event_dict)
        
        if not inserted_data:
            raise HTTPException(status_code=500, detail="Failed to insert event into database")
        
        # Add custom logic
        response_data = EventResponse(**inserted_data)
        if event.event_type == "crash":
            response_data.priority = "high"
        
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{event_id}/upload-image", response_model=EventResponse)
async def upload_event_image(
    event_id: str,
    file: UploadFile = File(...),
    service: SupabaseService = Depends(get_supabase_service)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Validate file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    try:
        # Generate random filename
        file_extension = file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_extension}"

        # Upload to Supabase Storage
        public_url = service.upload_image(file_content, file_name)

        # Update event record in database
        updated_event = service.update_event_image(event_id, public_url)

        if not updated_event:
            raise HTTPException(status_code=404, detail="Event not found")

        # Create response
        response_data = EventResponse(**updated_event)
        if updated_event.get("event_type") == "crash":
            response_data.priority = "high"

        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[EventResponse])
async def get_events(
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    service: SupabaseService = Depends(get_supabase_service)
):
    try:
        events = service.get_events(event_type)
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/nearby-events")
async def get_nearby_events(
    lat: float = Query(..., description="User latitude"),
    lon: float = Query(..., description="User longitude")
):
    # Simulated dummy data for Live GPS Map monitoring
    # Generates anomalies around the user's current location (both close-by and scattered around the city)
    import random
    from datetime import datetime
    
    anomalies = []
    severities = ["high", "medium", "low"]
    types = ["pothole", "crash", "speed_breaker"]
    
    # 1. Generate 5 very close anomalies (within ~150 meters) for proximity and voice warning testing
    for i in range(5):
        lat_offset = random.uniform(-0.001, 0.001)
        lon_offset = random.uniform(-0.001, 0.001)
        anomalies.append({
            "id": f"near-{i}-{random.randint(1000, 9999)}",
            "event_type": random.choice(types),
            "latitude": lat + lat_offset,
            "longitude": lon + lon_offset,
            "timestamp": datetime.utcnow().isoformat(),
            "severity": random.choice(severities)
        })

    # 2. Generate 15 scattered anomalies around the city (up to 3-4 km radius)
    for i in range(15):
        lat_offset = random.uniform(-0.03, 0.03)
        lon_offset = random.uniform(-0.03, 0.03)
        anomalies.append({
            "id": f"far-{i}-{random.randint(1000, 9999)}",
            "event_type": random.choice(types),
            "latitude": lat + lat_offset,
            "longitude": lon + lon_offset,
            "timestamp": datetime.utcnow().isoformat(),
            "severity": random.choice(severities)
        })
        
    return anomalies
