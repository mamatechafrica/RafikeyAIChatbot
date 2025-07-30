import os
from typing import AsyncGenerator, Optional, Annotated
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from langgraph.graph import MessagesState
from langchain_openai import ChatOpenAI
from dataclasses import dataclass
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langgraph.runtime import get_runtime
from app.bot.prompt import PROMPT_REVISED
from langchain_core.messages import AnyMessage
from langgraph.runtime import get_runtime
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import InMemorySaver
from app.bot.tools import retriever_tool
from app.models import Conversations, User as UserModel
from app.core.database import SessionDep    
from sqlmodel import select
from datetime import datetime
from app.router.auth.login import get_current_active_user

load_dotenv()


# State 
class State(MessagesState):
    pass


@dataclass
class ContextSchema:
    user_name: str

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


model = ChatOpenAI(model="gpt-4o-mini", api_key=OPENAI_API_KEY)


embeddings = GoogleGenerativeAIEmbeddings(
    model='models/text-embedding-004', 
    google_api_key=GOOGLE_API_KEY,
)

vectostore = Chroma(
    embedding_function=embeddings,
    persist_directory='./rafike_db_V2'
)


def prompt(state: State) -> list[AnyMessage]:
    runtime = get_runtime(ContextSchema)
    system_msg = (
        f"You are a helpful assistant. Address the user as {runtime.context['user_name']}.\n\n"
        f"{PROMPT_REVISED}"
    )
    # Personalize PROMPT_REVISED with the user's name
    personalized_prompt = PROMPT_REVISED.format(user_name=runtime.context['user_name'])
    system_msg = (
        f"You are a helpful assistant. Address the user as {runtime.context['user_name']}.\n\n"
        f"{personalized_prompt}"
    )
    return [{"role": "system", "content": system_msg}] + state["messages"]


memory = InMemorySaver()

agent = create_react_agent(
    model=model,
    tools=[retriever_tool],
    prompt=prompt,
    context={"user_name": "Felix"},
    checkpointer=memory
)

config = {
    "configurable": {
        "thread_id": "thread123"
    }
}



router = APIRouter(
    prefix='/bot',
    tags=['Rafike ChatBot']
)




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
    

async def update_conversation_title(thread_id: str, user_id: int, db: SessionDep):
    """Update conversation title when we have enough responses"""
    try:
        # Get all conversations for this thread and user ordered by timestamp
        statement = select(Conversations).where(
            Conversations.thread_id == thread_id,
            Conversations.user_id == user_id
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
                
                # Update ALL conversations in this thread for this user with the title
                from sqlmodel import update
                
                update_statement = (
                    update(Conversations)
                    .where(
                        Conversations.thread_id == thread_id,
                        Conversations.user_id == user_id
                    )
                    .values(title=title)
                )
                
                db.exec(update_statement)
                db.commit()
                print(f"Generated title for thread {thread_id} (user {user_id}): {title}")
                
    except Exception as e:
        print(f"Error updating conversation title: {e}")



async def generate_stream_response_anonymous(user_input: str, thread_id: str) -> AsyncGenerator[str, None]:
    """Generate streaming response from the graph using the provided thread_id"""

    session_config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    for chunk, metadata in agent.stream(
        {"messages": [{"role": "user", "content": user_input}]},
        session_config,
        context={"user_name": "Friend"},
        stream_mode="messages",
    ):
        if metadata['langgraph_node'] == "agent":
            if chunk.content:
                print(f"Bot: {chunk.content}", end="", flush=True)
                yield chunk.content

async def generate_stream_response(user_input: str, thread_id: str, user_id: int, db: SessionDep) -> AsyncGenerator[str, None]:
    """Generate streaming response from the graph using the provided thread_id"""
    # Create a session-specific config with the provided thread_id
    session_config = {
        "configurable": {
            "thread_id": thread_id
        },
    }

    # Collect the full response to store in the database 
    full_response = ""
    
    for chunk, metadata in agent.stream(
        {"messages": [{"role": "user", "content": user_input}]},
        session_config,
        context={"user_name": "Felix"},
        stream_mode="messages",
    ):
        if metadata['langgraph_node'] == "agent":
            if chunk.content:
                print(f"Bot: {chunk.content}", end="", flush=True)
                # Accumulate the full response
                full_response += chunk.content
                print(full_response)
                yield chunk.content

    # Store the conversation in the database with user_id
    conversation = Conversations(
        thread_id=thread_id, 
        user_message=user_input,
        bot_response=full_response,
        timestamp=datetime.utcnow(),
        user_id=user_id  # Add user_id to link conversation to user
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    # Check if we should generate a title (after 5 responses)
    await update_conversation_title(thread_id, user_id, db)


@router.post('/anonymous_chat')
async def anonymous_chat(
    chat_input: ChatInput,
):
    """Chat endpoint for the bot - don't require authentication"""
    try:
        # Use the provided session_id or generate a fallback one
        thread_id = chat_input.session_id if chat_input.session_id else str(uuid.uuid4())
        print(f"Thread ID: {thread_id}")

        # Create the streaming response with user_id
        return StreamingResponse(
            generate_stream_response_anonymous(chat_input.message, thread_id),
            media_type="text/event-stream",
        )
    except Exception as e:
        return {"error": str(e)}


@router.post('/chat')
async def chat(
    chat_input: ChatInput, 
    db: SessionDep,
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """Chat endpoint for the bot - requires authentication"""
    try:
        # Use the provided session_id or generate a fallback one
        thread_id = chat_input.session_id if chat_input.session_id else str(uuid.uuid4())
        print(f"Thread ID: {thread_id}, User ID: {current_user.id}")
        
        # Create the streaming response with user_id
        return StreamingResponse(
            generate_stream_response(chat_input.message, thread_id, current_user.id, db),
            media_type="text/event-stream",
        )
    except Exception as e:
        return {"error": str(e)}
