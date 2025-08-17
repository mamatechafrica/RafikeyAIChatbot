from fastapi import FastAPI 
from app.router import chatbot_analysis, bot_router_v2, chroma_db
from app.router.auth import login
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os 


load_dotenv()
groq_api_key = os.getenv('GOOGLE_API_KEY')



app =  FastAPI(
    title='Rafike ChatBot',
    description="Rafike ChatBot",
    version="0.0.1",
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
    
)


@app.get('/health')
def health():
    return {'status': "ok"}




# //Add routers
app.include_router(login.router)
app.include_router(bot_router_v2.router)
# app.include_router(bot_router.router)
app.include_router(chatbot_analysis.router) 
app.include_router(chroma_db.router)
