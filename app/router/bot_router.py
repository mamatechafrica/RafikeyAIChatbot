from typing import AsyncGenerator, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.bot.nodes import graph
from pydantic import BaseModel
import uuid
from app.core.database import SessionDep    
from datetime import datetime
from app.models import Conversations




router = APIRouter(
    prefix='/bot',
    tags=['Rafike ChatBot']
)



# Base configuration template
config = {
    "configurable": {
        "thread_id": "default"  # This will be replaced with the session-specific ID
    }
}

class ChatInput(BaseModel):
    message: str
    session_id: Optional[str] = None

async def generate_stream_response(user_input: str, thread_id: str, db: SessionDep) -> AsyncGenerator[str, None]:
    """Generate streaming response from the graph using the provided thread_id"""
    # Create a session-specific config with the provided thread_id
    session_config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    # Collect the full response to store in the database 
    full_response = ""
    
    for chunk, metadata in graph.stream(
        {"messages": {"role": "user", "content": user_input}}, 
        session_config,
        stream_mode="messages"
    ):
        if metadata['langgraph_node'] == "agent":
            if chunk.content:
                # print(chunk.content, end='', flush=True)
                # Accumulate the full response
                full_response += chunk.content
                yield chunk.content

    # Store the conversation in the database 
    conversation = Conversations(
        thread_id=thread_id, 
        user_message=user_input,
        bot_response=full_response,
        timestamp=datetime.utcnow()
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)




@router.post('/chat')
async def chat(chat_input: ChatInput, db: SessionDep):
    """Chat endpoint for the bot"""
    try:
        # Use the provided session_id or generate a fallback one
        # (This should rarely be needed since the frontend now generates the ID)
        thread_id = chat_input.session_id if chat_input.session_id else str(uuid.uuid4())
        print(f"Thread ID: {thread_id}")
        
        # Create the streaming response
        return StreamingResponse(
            generate_stream_response(chat_input.message, thread_id, db),
            media_type="text/event-stream",
        )
    except Exception as e:
        return {"error": str(e)}
