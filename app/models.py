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


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    age: str | None = Field(default=None, index=True)
    email: str = Field(unique=True, index=True)
    gender: str | None = Field(default=None)
    relationship_status: str | None = Field(default=None)
    terms_accepted: bool = Field(default=False)
    password: str  # This should store the hashed password
    disabled: bool = Field(default=False)  # Optional: for user activation
    created_at: datetime = Field(default_factory=datetime.utcnow)
