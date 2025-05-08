from datetime import datetime, timedelta
import json
from fastapi import APIRouter
from sqlmodel import func, select
from app.bot.prompt import QUESTIONS_PROMPTS, SENTIMENT_ANALYSIS_PROMPT
from app.models import Hero, Conversations
from app.core.database import SessionDep
from langgraph.prebuilt import create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI

from dotenv import load_dotenv
import re
from typing import Dict, List

load_dotenv()

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot Analysis"],
    responses={404: {"description": "Not found"}},
)


llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")

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
    Extract and parse JSON from a text response that might contain markdown code blocks
    """
    # Try to extract JSON from markdown code blocks first
    json_code_block_pattern = r'```(?:json)?\n(.*?)\n```'
    code_block_match = re.search(json_code_block_pattern, response_text, re.DOTALL)
    
    if code_block_match:
        # Found a code block, try to parse its content as JSON
        try:
            json_str = code_block_match.group(1).strip()
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass
    
    # If no code block or parsing failed, try to find any JSON-like structure
    json_pattern = r'\{.*\}'
    json_match = re.search(json_pattern, response_text, re.DOTALL)
    
    if json_match:
        try:
            json_str = json_match.group(0)
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



@router.get('/')
def get_heroes(session: SessionDep):
    heroes = session.exec(select(Hero)).all()
    return heroes



@router.get('/convversations')
async def get_conversations(session: SessionDep):
    conversations = session.exec(select(Conversations)).all()
    return conversations    


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