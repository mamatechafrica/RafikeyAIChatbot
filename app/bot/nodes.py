from langchain_openai import ChatOpenAI
from langgraph_supervisor import create_supervisor
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from .prompt import SRHR_PROMPT, SUPERVISOR_PROMPT, HEALTHCARE_AGENT_PROMPT
from .tools import retriever_tool, search_hospital_referrals
from langgraph.checkpoint.memory import MemorySaver
from dotenv import load_dotenv
import os

load_dotenv()


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")



model = ChatOpenAI(model="gpt-4o-mini", api_key=OPENAI_API_KEY)



srhr_agent = create_react_agent(
    model=model, 
    name="srhr_agent",
    tools=[retriever_tool],
    prompt=SRHR_PROMPT,
)


healthcare_agent = create_react_agent(
    model=model,
    name="healthcare_agent",
    tools=[search_hospital_referrals],
    prompt=HEALTHCARE_AGENT_PROMPT,
)

# // Create the supervisor workflow 
workflow = create_supervisor(
    [srhr_agent, healthcare_agent],
    model=model,
    prompt=SUPERVISOR_PROMPT
)

memory = MemorySaver()

graph = workflow.compile(checkpointer=memory)

