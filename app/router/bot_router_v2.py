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
from app.bot.tools import retriever_tool, search_hospital_referrals, search_facilities_by_county
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
        f"You are a helpful assistant. Address the user as {runtime.context['user_name']}. Always great them referring to their name\n\n"
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
    tools=[retriever_tool, search_facilities_by_county, search_hospital_referrals],
    prompt=prompt,
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


async def generate_title_from_conversation(user_messages: list[str], bot_responses: list[str]) -> str:
    """Generate a conversation title based on user questions and bot responses"""
    try:
        # Initialize OpenAI model for title generation
        title_model = ChatOpenAI(
            model="gpt-4o-mini", 
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.5  # Slightly higher for more creative titles
        )
        
        # Combine user messages and bot responses into conversation format
        # Use first 3-4 exchanges for better context
        conversation_text = ""
        max_exchanges = min(4, len(user_messages), len(bot_responses))
        
        for i in range(max_exchanges):
            if i < len(user_messages):
                conversation_text += f"User: {user_messages[i]}\n"
            if i < len(bot_responses):
                # Truncate long responses to keep the prompt manageable
                response_preview = bot_responses[i][:300] if len(bot_responses[i]) > 300 else bot_responses[i]
                conversation_text += f"Rafiki: {response_preview}\n\n"
        
        # Enhanced prompt for better title generation
        title_prompt = f"""You are generating a concise, descriptive title for a health conversation between a user and Rafiki (a sexual and reproductive health chatbot).

        Based on this conversation excerpt:

        {conversation_text}

        Generate a SHORT title (3-6 words maximum) that captures the MAIN health topic discussed. 

        Guidelines:
        - Focus on the PRIMARY health concern or topic (e.g., "Contraception Options", "STI Testing", "Period Pain")
        - Use clear, straightforward language
        - Be respectful and non-judgmental
        - Avoid using the user's name or personal details
        - Keep it under 6 words
        - Make it specific enough to be useful but general enough to protect privacy

        Examples of good titles:
        - "Birth Control Methods"
        - "STI Testing Locations"
        - "Irregular Period Concerns"
        - "Pregnancy Questions"
        - "Relationship Consent"

        Generate ONLY the title, nothing else:"""
        
        # Generate title
        response = await title_model.ainvoke(title_prompt)
        title = response.content.strip()
        
        # Clean up the title (remove quotes if present)
        title = title.strip('"').strip("'")
        
        # Ensure title is not too long
        if len(title) > 60:
            title = title[:57] + "..."
        
        # Ensure we got something valid
        if not title or len(title) < 3:
            return "New Chat"
            
        return title
        
    except Exception as e:
        print(f"Error generating title: {e}")
        return "New Chat"  # Updated fallback title
    
async def update_conversation_title(thread_id: str, user_id: int, db: SessionDep):
    """Update conversation title - generates from first 2 exchanges, updates at 4+ exchanges"""
    try:
        # Get all conversations for this thread and user ordered by timestamp
        statement = select(Conversations).where(
            Conversations.thread_id == thread_id,
            Conversations.user_id == user_id
        ).order_by(Conversations.timestamp.asc())
        conversations = db.exec(statement).all()
        
        first_conv = conversations[0] if conversations else None
        if not first_conv:
            return
        
        current_title = first_conv.title
        conversation_count = len(conversations)
        
        # FIRST TITLE GENERATION: After 2 exchanges (initial title)
        if conversation_count == 2 and (current_title is None or current_title == "" or current_title == "New Chat"):
            print(f"Generating initial title from first 2 exchanges for thread {thread_id}")
            
            # Use only the first 2 exchanges
            user_messages = [conv.user_message for conv in conversations[:2]]
            bot_responses = [conv.bot_response for conv in conversations[:2]]
            
            title = await generate_title_from_conversation(user_messages, bot_responses)
            
            # Update all conversations with the initial title
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
            print(f"Initial title generated for thread {thread_id} (user {user_id}): {title}")
        
        # TITLE UPDATE: After 4+ exchanges (refine with more context)
        elif conversation_count >= 4 and conversation_count % 3 == 1:  # Update at 4, 7, 10, etc.
            print(f"Updating title with more context for thread {thread_id}")
            
            # Use up to 5 exchanges for the refined title
            max_exchanges = min(5, conversation_count)
            user_messages = [conv.user_message for conv in conversations[:max_exchanges]]
            bot_responses = [conv.bot_response for conv in conversations[:max_exchanges]]
            
            # Generate refined title
            refined_title = await generate_title_from_conversation(user_messages, bot_responses)
            
            # Only update if the new title is different and meaningful
            if refined_title != current_title and refined_title != "New Chat":
                from sqlmodel import update
                
                update_statement = (
                    update(Conversations)
                    .where(
                        Conversations.thread_id == thread_id,
                        Conversations.user_id == user_id
                    )
                    .values(title=refined_title)
                )
                
                db.exec(update_statement)
                db.commit()
                print(f"Title updated for thread {thread_id} (user {user_id}): {current_title} -> {refined_title}")
                
    except Exception as e:
        print(f"Error updating conversation title: {e}")
        db.rollback()  # Rollback on error to prevent partial updates

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

async def generate_stream_response(user_input: str, thread_id: str, user_id: int, user_name: str, db: SessionDep) -> AsyncGenerator[str, None]:
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
        context={"user_name": user_name},  # Use the actual user's name
        stream_mode="messages",
    ):
        if metadata['langgraph_node'] == "agent":
            if chunk.content:
                # print(f"Bot: {chunk.content}", end="", flush=True)
                print(user_name)
                # Accumulate the full response
                full_response += chunk.content
                print(full_response)
                yield chunk.content

    # Store the conversation in the database with user_id
    # Set initial title as "New Chat" for new conversations
    conversation = Conversations(
        thread_id=thread_id, 
        user_message=user_input,
        bot_response=full_response,
        timestamp=datetime.utcnow(),
        user_id=user_id,  # Add user_id to link conversation to user
        title="New Chat"  # Set default title
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    # Check if we should generate a meaningful title (after 3 exchanges)
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
        
        # Create the streaming response with user_id and user_name
        return StreamingResponse(
            generate_stream_response(
                chat_input.message, 
                thread_id, 
                current_user.id, 
                current_user.username,  # Pass the user's name
                db
            ),
            media_type="text/event-stream",
        )
    except Exception as e:
        return {"error": str(e)}