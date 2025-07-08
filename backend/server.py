from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import httpx
import json
import asyncio


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class TranslationRequest(BaseModel):
    prompt: str

class ConversationHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_input: str
    python_output: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    session_id: Optional[str] = None

class ConversationCreate(BaseModel):
    user_input: str
    python_output: str
    session_id: Optional[str] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/translate")
async def translate_to_python(request: TranslationRequest):
    """
    Translate English description to Python code using OpenRouter API with streaming.
    """
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    async def generate_stream():
        headers = {
            "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "English to Python Translator"
        }
        
        payload = {
            "model": "google/gemini-2.0-flash-experimental",
            "messages": [
                {
                    "role": "system", 
                    "content": """You are an expert Python programmer. Convert natural language descriptions to clean, efficient Python code. 
                    
                    Guidelines:
                    - Provide complete, working Python code
                    - Include proper documentation and comments
                    - Use best practices and clean coding standards
                    - Add example usage when helpful
                    - For functions, include docstrings
                    - For classes, include proper __init__ methods
                    - Handle edge cases appropriately
                    - Use meaningful variable names
                    - Provide only the code with minimal explanation unless asked
                    """
                },
                {"role": "user", "content": request.prompt}
            ],
            "stream": True,
            "max_tokens": 2000,
            "temperature": 0.3
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                async with client.stream(
                    "POST",
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        logger.error(f"OpenRouter API Error: {response.status_code} - {error_text}")
                        yield f"data: {json.dumps({'error': f'API Error: {response.status_code}'})}\n\n"
                        return
                    
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data = line[6:]  # Remove "data: " prefix
                            if data.strip() == "[DONE]":
                                break
                            try:
                                parsed = json.loads(data)
                                if "choices" in parsed and len(parsed["choices"]) > 0:
                                    delta = parsed["choices"][0].get("delta", {})
                                    content = delta.get("content", "")
                                    if content:
                                        yield f"data: {json.dumps({'content': content})}\n\n"
                            except json.JSONDecodeError:
                                continue
                        
        except httpx.TimeoutException:
            logger.error("OpenRouter API timeout")
            yield f"data: {json.dumps({'error': 'Request timeout. Please try again.'})}\n\n"
        except httpx.RequestError as e:
            logger.error(f"OpenRouter API request error: {e}")
            yield f"data: {json.dumps({'error': 'Network error. Please check your connection.'})}\n\n"
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            yield f"data: {json.dumps({'error': 'An unexpected error occurred. Please try again.'})}\n\n"

    return StreamingResponse(generate_stream(), media_type="text/event-stream")

@api_router.post("/conversation", response_model=ConversationHistory)
async def save_conversation(conversation: ConversationCreate):
    """
    Save conversation history to MongoDB.
    """
    try:
        conversation_dict = conversation.dict()
        conversation_obj = ConversationHistory(**conversation_dict)
        result = await db.conversations.insert_one(conversation_obj.dict())
        return conversation_obj
    except Exception as e:
        logger.error(f"Error saving conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to save conversation")

@api_router.get("/conversation", response_model=List[ConversationHistory])
async def get_conversation_history(session_id: Optional[str] = None, limit: int = 50):
    """
    Get conversation history from MongoDB.
    """
    try:
        query = {}
        if session_id:
            query["session_id"] = session_id
        
        conversations = await db.conversations.find(query).sort("timestamp", -1).limit(limit).to_list(limit)
        return [ConversationHistory(**conv) for conv in conversations]
    except Exception as e:
        logger.error(f"Error fetching conversation history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch conversation history")

@api_router.delete("/conversation/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """
    Delete a specific conversation from history.
    """
    try:
        result = await db.conversations.delete_one({"id": conversation_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"message": "Conversation deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete conversation")

@api_router.get("/health")
async def health_check():
    """
    Health check endpoint to verify service status.
    """
    try:
        # Check MongoDB connection
        await db.command("ping")
        return {
            "status": "healthy", 
            "timestamp": datetime.utcnow(),
            "services": {
                "database": "connected",
                "openrouter": "configured"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()