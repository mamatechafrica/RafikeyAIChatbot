from langchain.tools.retriever import create_retriever_tool
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
import os 


load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


embeddings = GoogleGenerativeAIEmbeddings(
    model='models/text-embedding-004', 
    google_api_key=GOOGLE_API_KEY,
    )

vectostore = Chroma(
    embedding_function=embeddings,
    persist_directory='./rafike_db'
)

retriever = vectostore.as_retriever()

retriever_tool = create_retriever_tool(
    retriever=retriever,
    name="rafike_retriever",
    description="Search for accurate, evidence-based information about Sexual and Reproductive Health and Rights (SRHR) topics. Use this tool to find up-to-date information on contraception, STIs, reproductive anatomy, pregnancy, menstruation, sexual consent, gender identity, reproductive rights, youth sexual education, and maternal health. This tool helps provide culturally sensitive and scientifically accurate responses to user queries about SRHR topics in English, Swahili, or Sheng.",
)
