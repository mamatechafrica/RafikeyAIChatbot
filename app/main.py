from fastapi import FastAPI
from sqlmodel import select, Session
from app.router import chatbot_analysis, bot_router_v2, chroma_db, metrics_analysis, gamification
from app.router.auth import login, admin
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from apscheduler.schedulers.background import BackgroundScheduler
from app.core.database import engine
from app.models import Conversations
from datetime import datetime, timedelta

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

# --- APScheduler for background cleanup ---
def delete_conversations_older_than_30_days():
    with Session(engine) as session:
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        expired_convs = session.exec(
            select(Conversations).where(
                Conversations.timestamp < cutoff_date
            )
        ).all()
        total_deleted = len(expired_convs)
        for conv in expired_convs:
            session.delete(conv)
        session.commit()
    if total_deleted > 0:
        print(f"[APScheduler] Deleted {total_deleted} conversations older than 30 days.")

scheduler = BackgroundScheduler()
scheduler.add_job(delete_conversations_older_than_30_days, 'interval', days=1)
scheduler.start()


# //Add routers
app.include_router(admin.router)
app.include_router(login.router)
app.include_router(bot_router_v2.router)
# app.include_router(bot_router.router)
app.include_router(chatbot_analysis.router) 
app.include_router(chroma_db.router)
app.include_router(metrics_analysis.router)
app.include_router(gamification.router)