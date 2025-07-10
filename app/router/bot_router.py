from typing import AsyncGenerator, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.bot.nodes import graph
from pydantic import BaseModel
import uuid
from app.core.database import SessionDep    
from datetime import datetime
from app.models import Conversations
from sqlmodel import select
from langchain_openai import ChatOpenAI
import os

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


async def generate_title_from_responses(responses: list[str]) -> str:
    """Generate a conversation title based on the first few AI responses"""
    try:
        # Initialize OpenAI model for title generation
        title_model = ChatOpenAI(
            model="gpt-4o-mini", 
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.3
        )
        
        # Combine the responses into a single text
        combined_responses = "\n".join(responses[:5])  # Use first 5 responses
        
        # Create prompt for title generation
        title_prompt = f"""Based on the following AI responses from a conversation, generate a short, descriptive title (maximum 6 words) that captures the main topic or theme of the conversation:

{combined_responses}

Generate only the title, nothing else. Make it concise and relevant to the main topic discussed."""
        
        # Generate title
        response = await title_model.ainvoke(title_prompt)
        title = response.content.strip()
        
        # Ensure title is not too long
        if len(title) > 50:
            title = title[:47] + "..."
            
        return title
        
    except Exception as e:
        print(f"Error generating title: {e}")
        return "Conversation"  # Fallback title
    


async def update_conversation_title(thread_id: str, db: SessionDep):
    """Update conversation title when we have enough responses"""
    try:
        # Get all conversations for this thread ordered by timestamp
        statement = select(Conversations).where(
            Conversations.thread_id == thread_id
        ).order_by(Conversations.timestamp.asc())
        conversations = db.exec(statement).all()
        
        if len(conversations) >= 5:
            # Check if title has already been generated
            first_conv = conversations[0]
            if first_conv.title is None or first_conv.title == "":
                # Get the first 5 bot responses
                bot_responses = [conv.bot_response for conv in conversations[:5]]
                
                # Generate title
                title = await generate_title_from_responses(bot_responses)
                
                # Update ALL conversations in this thread with the title
                # Use a direct SQL update for better performance and to ensure all records are updated
                from sqlmodel import update
                
                update_statement = (
                    update(Conversations)
                    .where(Conversations.thread_id == thread_id)
                    .values(title=title)
                )
                
                db.exec(update_statement)
                db.commit()
                print(f"Generated title for thread {thread_id}: {title}")
                
    except Exception as e:
        print(f"Error updating conversation title: {e}")

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
                print(f"Bot: {chunk.content}", end="", flush=True)
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

    # Check if we should generate a title (after 5 responses)
    await update_conversation_title(thread_id, db)


@router.post('/chat')
async def chat(chat_input: ChatInput, db: SessionDep):
    """Chat endpoint for the bot"""
    try:
        # Use the provided session_id or generate a fallback one
        thread_id = chat_input.session_id if chat_input.session_id else str(uuid.uuid4())
        # print(f"Thread ID: {thread_id}")
        
        # Create the streaming response
        return StreamingResponse(
            generate_stream_response(chat_input.message, thread_id, db),
            media_type="text/event-stream",
        )
    except Exception as e:
        return {"error": str(e)}
    


@router.post('/conversations/generate-missing-titles')
async def generate_missing_titles(db: SessionDep):
    """Generate titles for all threads that don't have titles but have 5+ conversations"""
    try:
        # Get all conversations
        statement = select(Conversations).order_by(Conversations.timestamp.asc())
        all_conversations = db.exec(statement).all()
        
        # Group by thread_id
        threads = {}
        for conv in all_conversations:
            if conv.thread_id not in threads:
                threads[conv.thread_id] = []
            threads[conv.thread_id].append(conv)
        
        updated_threads = []
        
        # Process each thread
        for thread_id, conversations in threads.items():
            # Check if thread has 5+ conversations and no title
            if len(conversations) >= 5 and (not conversations[0].title or conversations[0].title == ""):
                try:
                    # Get the first 5 bot responses
                    bot_responses = [conv.bot_response for conv in conversations[:5]]
                    
                    # Generate title
                    title = await generate_title_from_responses(bot_responses)
                    
                    # Update all conversations in this thread
                    from sqlmodel import update
                    
                    update_statement = (
                        update(Conversations)
                        .where(Conversations.thread_id == thread_id)
                        .values(title=title)
                    )
                    
                    db.exec(update_statement)
                    updated_threads.append({
                        "thread_id": thread_id,
                        "title": title,
                        "conversations_count": len(conversations)
                    })
                    
                except Exception as e:
                    print(f"Error generating title for thread {thread_id}: {e}")
                    continue
        
        db.commit()
        
        return {
            "message": f"Generated titles for {len(updated_threads)} threads",
            "updated_threads": updated_threads
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
