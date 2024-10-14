from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import asyncio
from typing import Dict, List, Optional, Any
import time

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for queues
queues: Dict[str, List[dict]] = {}


class Message(BaseModel):
    content: Dict[str, Any] = Field(..., description="The message content")


@app.post("/api/{queue_name}")
async def add_message(queue_name: str, message: Message):
    if queue_name not in queues:
        queues[queue_name] = []
    queues[queue_name].append(message.content)
    return {"status": "Message added to queue"}


@app.get("/api/queues")
async def get_queues():
    return {queue: len(messages) for queue, messages in queues.items()}


@app.get("/api/{queue_name}")
async def get_message(queue_name: str, timeout: Optional[int] = 10000):
    start_time = time.time()
    while time.time() - start_time < timeout / 1000:
        if queue_name in queues and queues[queue_name]:
            return queues[queue_name].pop(0)
        await asyncio.sleep(0.1)
    raise HTTPException(status_code=204, detail="No message available")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
