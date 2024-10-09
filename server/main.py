from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import time
from collections import defaultdict
from threading import Lock

app = FastAPI()


class Message(BaseModel):
    content: str


queues = defaultdict(list)
locks = defaultdict(Lock)


@app.post("/api/{queue_name}")
async def post_message(queue_name: str, message: Message):
    with locks[queue_name]:
        queues[queue_name].append(message.content)
    return {"message": "Message added to queue"}


@app.get("/api/{queue_name}")
async def get_message(queue_name: str, timeout: Optional[int] = 10000):
    timeout_seconds = timeout / 1000
    start_time = time.time()

    while time.time() - start_time < timeout_seconds:
        with locks[queue_name]:
            if queues[queue_name]:
                return {"message": queues[queue_name].pop(0)}
        time.sleep(0.1)
    raise HTTPException(status_code=204, detail="No messages in queue")
