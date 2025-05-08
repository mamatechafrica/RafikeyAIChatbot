from typing import Annotated
from sqlmodel import Field, Session, SQLModel, create_engine, select
from datetime import datetime


class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    age: int | None = Field(default=None, index=True)
    secret_name: str


class Conversations(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    thread_id: str
    user_message: str
    bot_response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
