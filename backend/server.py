from fastapi import FastAPI, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Database Connection
MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    raise Exception("MONGO_URL not found in environment variables")

client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database("app_db")
collection = db.get_collection("substances")

# Models
class SubstanceSearchItem(BaseModel):
    name: str
    summary: Optional[str] = None
    featured: Optional[bool] = None
    url: Optional[str] = None

class SubstanceDetail(BaseModel):
    id: str = Field(alias="_id")
    name: str
    url: Optional[str] = None
    summary: Optional[str] = None
    featured: Optional[bool] = None
    roas: Optional[List[Dict[str, Any]]] = None
    images: Optional[List[Dict[str, Any]]] = None
    interactions_flat: Optional[List[Dict[str, str]]] = None
    addictionPotential: Optional[str] = None
    tolerance: Optional[Dict[str, Any]] = None

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/substances", response_model=List[SubstanceSearchItem])
async def get_substances(search: Optional[str] = None, limit: int = 100):
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    cursor = collection.find(query, {"name": 1, "summary": 1, "featured": 1, "url": 1}).sort("name", 1).limit(limit)
    results = await cursor.to_list(length=limit)
    return results

@app.get("/api/substances/{name}")
async def get_substance_detail(name: str):
    substance = await collection.find_one({"name": name})
    if not substance:
        # Try case insensitive
        substance = await collection.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
        if not substance:
            raise HTTPException(status_code=404, detail="Substance not found")
    
    substance["_id"] = str(substance["_id"])
    return substance

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
