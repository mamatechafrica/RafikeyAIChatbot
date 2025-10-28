from datetime import datetime, timedelta
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select
from app.bot.prompt import QUESTIONS_PROMPTS, SENTIMENT_ANALYSIS_PROMPT, TOPIC_EXTRACTION_PROMPT
from app.models import Hero, Conversations, User as UserModel
from app.core.database import SessionDep
from langgraph.prebuilt import create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from app.router.auth.login import get_current_active_user
from typing import Annotated


from dotenv import load_dotenv
import re 
from typing import Dict, List

load_dotenv()

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot Analysis"],
    responses={404: {"description": "Not found"}},
)


# llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
llm = ChatOpenAI(
    model='gpt-4o-mini',
    temperature=0,
)

def extract_questions_with_counts(ai_response: str) -> List[Dict[str, any]]:
    """
    Extract questions and their counts from the AI response text
    """
    # Pattern to match numbered list items with count (e.g., "1. what is LGBTQ (asked 5 times)")
    pattern = r'\d+\.\s+(.*?)\s+\(asked\s+(\d+)\s+times?\)'
    
    # Find all matches
    matches = re.findall(pattern, ai_response, re.DOTALL)
    
    # Format the results as a list of dictionaries
    questions_with_counts = [
        {
            "question": question.strip(),
            "count": int(count)
        }
        for question, count in matches
    ]
    
    return questions_with_counts

def extract_json_from_response(response_text: str):
    """
    Extract and parse JSON (object or array) from a text response that might contain markdown code blocks.
    """
    # Try to extract JSON from markdown code blocks first (object or array)
    json_code_block_pattern = r'```(?:json)?\n(.*?)\n```'
    code_block_match = re.search(json_code_block_pattern, response_text, re.DOTALL)
    if code_block_match:
        try:
            json_str = code_block_match.group(1).strip()
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass

    # Try to find a top-level JSON array
    json_array_pattern = r'\[\s*{.*?}\s*\]'
    json_array_match = re.search(json_array_pattern, response_text, re.DOTALL)
    if json_array_match:
        try:
            json_str = json_array_match.group(0)
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass

    # Try to find a top-level JSON object
    json_object_pattern = r'\{.*\}'
    json_object_match = re.search(json_object_pattern, response_text, re.DOTALL)
    if json_object_match:
        try:
            json_str = json_object_match.group(0)
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass

    # If all parsing attempts fail, return None
    return None

def parse_ai_questions_response(ai_response: str) -> list[dict]:
    """
    Parse the AI response containing questions with frequencies into a structured list.
    
    Example input:
    "1. How do I know my periods are almost coming? (frequency: 1)\n2. Can I take any medication? (frequency: 1)"
    
    Example output:
    [
        {"question": "How do I know my periods are almost coming?", "frequency": 1},
        {"question": "Can I take any medication?", "frequency": 1}
    ]
    """
    result = []
    
    # Split the response into lines for each question
    lines = ai_response.strip().split('\n')
    
    for line in lines:
        # Skip empty lines
        if not line.strip():
            continue
            
        # Extract the question part and frequency part
        try:
            # Remove the numbering prefix (e.g., "1. ")
            # The regex \d+\.\s* would match things like "1. ", "42. " etc.
            import re
            line_without_prefix = re.sub(r'^\d+\.\s*', '', line)
            
            # Split by the frequency part
            parts = line_without_prefix.split("(frequency:")
            
            if len(parts) >= 2:
                question = parts[0].strip()
                # Extract the frequency number
                frequency_str = parts[1].strip()
                frequency = int(re.search(r'\d+', frequency_str).group())
                
                result.append({
                    "question": question,
                    "frequency": frequency
                })
        except Exception as e:
            # If there's an error parsing a line, add it with an error flag
            result.append({
                "question": line.strip(),
                "frequency": 0,
                "error": f"Failed to parse: {str(e)}"
            })
    
    return result

summary_agent = create_react_agent(
    llm, 
    tools=[],
    prompt=QUESTIONS_PROMPTS
)

sentiment_agent = create_react_agent(
    llm,
    tools=[],
    prompt=SENTIMENT_ANALYSIS_PROMPT
)

topics_agent = create_react_agent(
    llm, 
    tools=[],
    prompt=TOPIC_EXTRACTION_PROMPT
)

@router.get('/')
def get_heroes(session: SessionDep):
    heroes = session.exec(select(Hero)).all()
    return heroes



@router.get('/convversations')
async def get_conversations(session: SessionDep):
    conversations = session.exec(select(Conversations)).all()
    return conversations    

# NEW ENDPOINT: Get authenticated user's own conversations
@router.get('/my-conversations')
async def get_my_conversations(
    session: SessionDep,
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """Get all conversations for the authenticated user only"""
    try:
        # Query conversations that belong to the authenticated user
        statement = select(Conversations).where(
            Conversations.user_id == current_user.id
        ).order_by(Conversations.timestamp.desc())
        
        conversations = session.exec(statement).all()
        
        return {
            "user_id": current_user.id,
            "username": current_user.username,
            "total_conversations": len(conversations),
            "conversations": conversations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/conversations/grouped')
async def get_grouped_conversations(db: SessionDep):
    """Get all conversations grouped by thread_id"""
    try:
        # Get all conversations ordered by timestamp
        statement = select(Conversations).order_by(Conversations.timestamp.desc())
        all_conversations = db.exec(statement).all()
        
        # Group conversations by thread_id
        grouped_conversations = {}
        
        for conversation in all_conversations:
            thread_id = conversation.thread_id
            
            if thread_id not in grouped_conversations:
                grouped_conversations[thread_id] = {
                    "thread_id": thread_id,
                    "title": conversation.title,
                    "message_count": 0,
                    "created_at": conversation.timestamp,
                    "last_message_at": conversation.timestamp,
                    "conversations": []
                }
            
            # Update thread metadata
            grouped_conversations[thread_id]["message_count"] += 1
            
            # Update timestamps (since we're ordering by desc, first is latest)
            if conversation.timestamp > grouped_conversations[thread_id]["last_message_at"]:
                grouped_conversations[thread_id]["last_message_at"] = conversation.timestamp
            if conversation.timestamp < grouped_conversations[thread_id]["created_at"]:
                grouped_conversations[thread_id]["created_at"] = conversation.timestamp
                
            # Add conversation to the group
            grouped_conversations[thread_id]["conversations"].append({
                "id": conversation.id,
                "user_message": conversation.user_message,
                "bot_response": conversation.bot_response,
                "timestamp": conversation.timestamp
            })
        
        # Convert to list and sort by last message timestamp (most recent first)
        result = list(grouped_conversations.values())
        result.sort(key=lambda x: x["last_message_at"], reverse=True)
        
        return {
            "total_threads": len(result),
            "threads": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/my-conversations/threads')
async def get_my_thread_list(
    db: SessionDep,
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """Get all thread IDs with their titles for the authenticated user only"""
    try:
        from sqlmodel import func
        
        statement = (
            select(Conversations.thread_id, Conversations.title, func.max(Conversations.timestamp).label('last_message_at'))
            .where(Conversations.user_id == current_user.id)
            .group_by(Conversations.thread_id, Conversations.title)
            .order_by(func.max(Conversations.timestamp).desc())
        )
        
        results = db.exec(statement).all()
        
        threads = [
            {
                "thread_id": result.thread_id,
                "title": result.title or "New Chat",
                "last_message_at": result.last_message_at
            }
            for result in results
        ]
        
        return {
            "user_id": current_user.id,
            "username": current_user.username,
            "total_threads": len(threads),
            "threads": threads
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get('/conversations/threads')
async def get_thread_list(db: SessionDep):
    """Get all thread IDs with their titles only"""
    try:
        # Get distinct thread_ids with their titles
        # Since all conversations in a thread have the same title, we can use any record
        from sqlmodel import func, distinct
        
        statement = (
            select(Conversations.thread_id, Conversations.title, func.max(Conversations.timestamp).label('last_message_at'))
            .group_by(Conversations.thread_id, Conversations.title)
            .order_by(func.max(Conversations.timestamp).desc())
        )
        
        results = db.exec(statement).all()
        
        threads = [
            {
                "thread_id": result.thread_id,
                "title": result.title or "New Chat",
                "last_message_at": result.last_message_at
            }
            for result in results
        ]
        
        return {
            "total_threads": len(threads),
            "threads": threads
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/conversations/{thread_id}')
async def get_conversation_history(thread_id: str, db: SessionDep):
    """Get conversation history for a thread"""
    statement = select(Conversations).where(Conversations.thread_id == thread_id)
    conversations = db.exec(statement).all()
    return conversations


@router.get('/conversations/threads/date-range')
async def get_threads_by_date_range(
    start_date: str, 
    end_date: str, 
    db: SessionDep
):
    """Get all thread IDs with their titles for a date range (format: YYYY-MM-DD)"""
    try:
        from datetime import datetime
        
        # Parse the date strings
        try:
            start_target = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_target = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD (e.g., 2025-07-09)")
        
        # Create start and end datetime for the full range
        start_datetime = datetime.combine(start_target, datetime.min.time())
        end_datetime = datetime.combine(end_target, datetime.max.time())
        
        # Get distinct thread_ids with their titles for conversations created in this range
        from sqlmodel import func, and_
        
        statement = (
            select(
                Conversations.thread_id, 
                Conversations.title, 
                func.min(Conversations.timestamp).label('first_message_at'),
                func.max(Conversations.timestamp).label('last_message_at'),
                func.count(Conversations.id).label('message_count')
            )
            .where(
                and_(
                    Conversations.timestamp >= start_datetime,
                    Conversations.timestamp <= end_datetime
                )
            )
            .group_by(Conversations.thread_id, Conversations.title)
            .order_by(func.max(Conversations.timestamp).desc())
        )
        
        results = db.exec(statement).all()
        
        threads = [
            {
                "thread_id": result.thread_id,
                "title": result.title or "New Chat",
                "first_message_at": result.first_message_at,
                "last_message_at": result.last_message_at,
                "message_count": result.message_count
            }
            for result in results
        ]
        
        return {
            "start_date": start_date,
            "end_date": end_date,
            "total_threads": len(threads),
            "threads": threads
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get the count of unique thread IDs
@router.get('/unique_thread_ids/count')
async def get_unique_thread_ids_count(session: SessionDep):
    # Query the database to count the number of unique thread IDs
    count = session.exec(select(func.count(Conversations.thread_id.distinct()))).one()
    return {"count": count}


# Get conversation data for plotting a line graph over time
@router.get('/conversations/time_series')
async def get_conversation_time_series(
    session: SessionDep,
    interval: str = "day",  # Options: hour, day, week, month
    days: int = 30  # Number of days to look back
):
    # Calculate the start date based on the number of days to look back
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Define the date trunc function based on the interval
    if interval == "hour":
        # Group by hour
        query = select(
            func.date_trunc('hour', Conversations.timestamp).label('time_period'),
            func.count().label('conversation_count')
        ).where(
            Conversations.timestamp >= start_date
        ).group_by(
            func.date_trunc('hour', Conversations.timestamp)
        ).order_by(
            func.date_trunc('hour', Conversations.timestamp)
        )
    elif interval == "day":
        # Group by day
        query = select(
            func.date_trunc('day', Conversations.timestamp).label('time_period'),
            func.count().label('conversation_count')
        ).where(
            Conversations.timestamp >= start_date
        ).group_by(
            func.date_trunc('day', Conversations.timestamp)
        ).order_by(
            func.date_trunc('day', Conversations.timestamp)
        )
    elif interval == "week":
        # Group by week
        query = select(
            func.date_trunc('week', Conversations.timestamp).label('time_period'),
            func.count().label('conversation_count')
        ).where(
            Conversations.timestamp >= start_date
        ).group_by(
            func.date_trunc('week', Conversations.timestamp)
        ).order_by(
            func.date_trunc('week', Conversations.timestamp)
        )
    elif interval == "month":
        # Group by month
        query = select(
            func.date_trunc('month', Conversations.timestamp).label('time_period'),
            func.count().label('conversation_count')
        ).where(
            Conversations.timestamp >= start_date
        ).group_by(
            func.date_trunc('month', Conversations.timestamp)
        ).order_by(
            func.date_trunc('month', Conversations.timestamp)
        )
    else:
        # Default to day if invalid interval is provided
        query = select(
            func.date_trunc('day', Conversations.timestamp).label('time_period'),
            func.count().label('conversation_count')
        ).where(
            Conversations.timestamp >= start_date
        ).group_by(
            func.date_trunc('day', Conversations.timestamp)
        ).order_by(
            func.date_trunc('day', Conversations.timestamp)
        )
    
    # Execute the query
    results = session.exec(query).all()
    
    # Format the results for plotting
    time_series_data = [
        {
            "time_period": result.time_period.isoformat(),
            "conversation_count": result.conversation_count
        }
        for result in results
    ]
    
    return {
        "interval": interval,
        "days_range": days,
        "data": time_series_data
    }


@router.get('/questions')
async def get_questions(session: SessionDep):
    # Query the database to get all questions
    questions = session.exec(select(Conversations.user_message)).all()
    
    # Get the AI to process and organize the questions
    filtered_questions = summary_agent.invoke({"messages": questions})
    
    # Extract the AI's response text
    ai_response = filtered_questions['messages'][-1].content
    
    # Parse the response to extract the list of questions with counts
    parsed_questions = parse_ai_questions_response(ai_response)

    
    return parsed_questions


@router.get('/sentiment_analysis')
async def get_sentiment_analysis(session: SessionDep):
    # Query the database to get all questions
    questions = session.exec(select(Conversations.user_message)).all()
    filtered_questions = sentiment_agent.invoke({"messages": questions})
    ai_response = filtered_questions['messages'][-1].content
    
    # Extract JSON from the response
    sentiment_data = extract_json_from_response(ai_response)
    
    return sentiment_data


@router.get('/topics')
async def get_topics(session: SessionDep):
    # Query the database to get all questions 
    questions = session.exec(select(Conversations.user_message)).all()
    topics = topics_agent.invoke({"messages": questions})
    ai_response = topics['messages'][-1].content

    # Extract JSON from the response
    topic_data = extract_json_from_response(ai_response)

    return topic_data



@router.get('/thread_activity')
async def get_thread_activity(
    session: SessionDep,
    days: int = 30,  # Number of days to look back
    mode: str = "all"  # Options: "creation" (first message) or "all" (all messages)
):
    # Calculate the start date based on the number of days to look back
    start_date = datetime.utcnow() - timedelta(days=days)
    
    if mode == "creation":
        # For each thread_id, get only the timestamp of its first message
        # This subquery finds the minimum timestamp for each thread_id
        subquery = select(
            Conversations.thread_id,
            func.min(Conversations.timestamp).label('first_timestamp')
        ).where(
            Conversations.timestamp >= start_date
        ).group_by(
            Conversations.thread_id
        ).subquery()
        
        # Main query joins with the subquery to get the thread_id and its first timestamp
        query = select(
            subquery.c.thread_id,
            subquery.c.first_timestamp.label('timestamp')
        ).order_by(
            subquery.c.first_timestamp
        )
    else:
        # Get all thread_id and timestamp pairs
        query = select(
            Conversations.thread_id,
            Conversations.timestamp
        ).where(
            Conversations.timestamp >= start_date
        ).order_by(
            Conversations.timestamp
        )
    
    # Execute the query
    results = session.exec(query).all()
    
    # Format the results for plotting
    thread_activity = [
        {
            "thread_id": result.thread_id,
            "timestamp": result.timestamp.isoformat()
        }
        for result in results
    ]
    
    return {
        "days_range": days,
        "mode": mode,
        "data": thread_activity
    }



# Endpoint to get the number of active users today
@router.get('/active_users_today')
async def get_active_users_today(session: SessionDep):
    """
    Get the number of unique users who have interacted with the chatbot today.
    """
    from datetime import datetime, time

    # Get current date in UTC
    now = datetime.utcnow()
    today_start = datetime.combine(now.date(), time.min)

    # Query for distinct user_ids in Conversations where timestamp >= today_start
    count = session.exec(
        select(func.count(Conversations.user_id.distinct()))
        .where(Conversations.timestamp >= today_start)
    ).one()

    return {"active_users_today": count}


# Endpoint to delete conversations by thread_id
@router.delete('/conversations/{thread_id}', status_code=200)
async def delete_conversations_by_thread_id(
    thread_id: str,
    session: SessionDep,
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """
    Delete all conversations with the specified thread_id for the authenticated user only.
    """
    try:
        statement = select(Conversations).where(
            (Conversations.thread_id == thread_id) &
            (Conversations.user_id == current_user.id)
        )
        conversations = session.exec(statement).all()
        if not conversations:
            raise HTTPException(status_code=404, detail="No conversations found for the given thread_id and user.")
        for conversation in conversations:
            session.delete(conversation)
        session.commit()
        return {"message": f"Deleted {len(conversations)} conversations with thread_id '{thread_id}' for user '{current_user.username}'."}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to delete all conversations
@router.delete('/conversations', status_code=200)
async def delete_all_conversations(
    session: SessionDep,
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """
    Delete all conversations for the authenticated user only.
    """
    try:
        statement = select(Conversations).where(Conversations.user_id == current_user.id)
        conversations = session.exec(statement).all()
        count = len(conversations)
        if count == 0:
            return {"message": "No conversations to delete for this user."}
        for conversation in conversations:
            session.delete(conversation)
        session.commit()
        return {"message": f"Deleted all ({count}) conversations for user '{current_user.username}'."}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to delete conversations older than 30 days from user join date
@router.delete('/conversations/expired', status_code=200)
async def delete_expired_conversations(
    session: SessionDep,
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """
    Delete all conversations for the authenticated user that are older than 30 days from their join (created_at) date.
    """
    try:
        # Calculate the cutoff date: 30 days after user joined
        cutoff_date = current_user.created_at + timedelta(days=30)
        # Delete conversations older than cutoff_date
        statement = select(Conversations).where(
            (Conversations.user_id == current_user.id) &
            (Conversations.timestamp < cutoff_date)
        )
        conversations = session.exec(statement).all()
        count = len(conversations)
        if count == 0:
            return {"message": "No expired conversations to delete for this user."}
        for conversation in conversations:
            session.delete(conversation)
        session.commit()
        return {"message": f"Deleted {count} expired conversations for user '{current_user.username}' (joined: {current_user.created_at.date()}, cutoff: {cutoff_date.date()})."}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


