from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import events, route_logs
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Smart Road Intelligence API",
    description="Backend for real-time pothole detection and road event tracking",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(events.router, prefix="/api/v1")
app.include_router(route_logs.router, prefix="/api/v1/routes")

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Smart Road Intelligence System API",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
