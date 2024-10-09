from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from typing import Dict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

queues: Dict[str, asyncio.Queue] = {}


class Message(BaseModel):
    content: str


@app.on_event("startup")
async def startup_event():
    queues["queue1"] = asyncio.Queue()
    queues["queue2"] = asyncio.Queue()


@app.post("/api/{queue_name}")
async def post_message(queue_name: str, message: Message):
    if queue_name not in queues:
        queues[queue_name] = asyncio.Queue()
    await queues[queue_name].put(message.content)
    return {"status": "Message added"}


@app.get("/api/{queue_name}")
async def get_message(queue_name: str, timeout: int = 10):
    if queue_name not in queues:
        raise HTTPException(status_code=404, detail="Queue not found")

    queue = queues[queue_name]
    try:
        message = await asyncio.wait_for(queue.get(), timeout=timeout)
        return {"message": message}
    except asyncio.TimeoutError:
        raise HTTPException(status_code=204, detail="No messages in queue")
