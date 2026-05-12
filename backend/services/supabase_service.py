import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

class SupabaseService:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment")
        self.client: Client = create_client(self.url, self.key)

    def insert_event(self, event_data: dict):
        response = self.client.table("events").insert(event_data).execute()
        return response.data[0] if response.data else None

    def get_events(self, event_type: Optional[str] = None):
        query = self.client.table("events").select("*")
        if event_type:
            query = query.eq("event_type", event_type)
        
        response = query.execute()
        return response.data

    def upload_image(self, file_data: bytes, file_name: str):
        bucket_name = "pothole-images"
        # Supabase storage upload
        # We assume the bucket is already created as public
        response = self.client.storage.from_(bucket_name).upload(
            path=file_name,
            file=file_data,
            file_options={"content-type": "image/jpeg"} # Defaulting to jpeg for simplicity
        )
        # Get public URL
        public_url = self.client.storage.from_(bucket_name).get_public_url(file_name)
        return public_url

    def update_event_image(self, event_id: str, image_url: str):
        response = self.client.table("events").update({"image_url": image_url}).eq("id", event_id).execute()
        return response.data[0] if response.data else None

# Dependency to get service instance
def get_supabase_service():
    return SupabaseService()
