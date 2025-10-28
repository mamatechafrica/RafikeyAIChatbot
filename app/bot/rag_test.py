from langchain.chat_models import init_chat_model
from langchain_chroma import Chroma
from langgraph.graph import MessagesState, StateGraph, START, END 
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.prebuilt import ToolNode, tools_condition
from langchain.tools.retriever import create_retriever_tool
from langchain_chroma import Chroma
import os
from dotenv import load_dotenv
from prompt import PROMPT_REVISED
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import ChatOpenAI
from dataclasses import dataclass
from langgraph.runtime import Runtime
from langchain_core.messages import AnyMessage
from langgraph.runtime import get_runtime
from langgraph.prebuilt import create_react_agent
from langgraph.prebuilt.chat_agent_executor import AgentState


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


retriever = vectostore.as_retriever()

retriever_tool = create_retriever_tool(
    retriever=retriever,
    name="rafike_retriever",
    description="Search for accurate, evidence-based information about Sexual and Reproductive Health and Rights (SRHR) topics. Use this tool to find up-to-date information on contraception, STIs, reproductive anatomy, pregnancy, menstruation, sexual consent, gender identity, reproductive rights, youth sexual education, and maternal health. This tool helps provide culturally sensitive and scientifically accurate responses to user queries about SRHR topics in English, Swahili, or Sheng.",
)

def prompt(state: AgentState) -> list[AnyMessage]:
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

# result = agent.stream(
#     {"messages": [{"role": "user", "content": "Hi"}]},
#     context={"user_name": "Felix"},
#     stream_mode="messages"
# )


while True:
    user_input = input("Enter your query:\n")
    for chunk, metadata in agent.stream(
        {"messages": [{"role": "user", "content": user_input}]},
        config,
        context={"user_name": "Felix"},
        stream_mode="messages",
    ):
        if metadata["langgraph_node"] == "agent":

            print(chunk.content, end="", flush=True)
