from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from services.supabase_service import SupabaseService, get_supabase_service
from schemas.route import RouteLogCreate

router = APIRouter(tags=["routes"])

@router.post("/log")
async def log_route(
    route_log: RouteLogCreate, 
    supabase: SupabaseService = Depends(get_supabase_service)
):
    try:
        route_data = route_log.model_dump()
        result = supabase.insert_route_log(route_data)
        if not result:
             raise HTTPException(status_code=400, detail="Could not insert route log")
        return {"status": "success", "data": result}
    except Exception as e:
        # In a real environment, you might log this instead of failing loudly if it's just analytics
        raise HTTPException(status_code=500, detail=str(e))
