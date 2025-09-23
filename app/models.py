from typing import Annotated, List, Optional
from sqlmodel import Field, Session, SQLModel, create_engine, select, Relationship
from datetime import datetime


class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    age: int | None = Field(default=None, index=True)
    secret_name: str


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
    is_admin: bool = Field(default=False, index=True)  # New field to indicate admin user
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship to conversations
    conversations: List["Conversations"] = Relationship(back_populates="user")


class Conversations(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    thread_id: str = Field(index=True)  # Added index for better query performance
    title: str | None = Field(default=None, max_length=255, index=True)  # Added length limit and index
    user_message: str
    bot_response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)  # Added index for time-based queries
    
    # Foreign key to User
    user_id: int = Field(foreign_key="user.id", index=True)
    
    # Relationship to user
    user: User = Relationship(back_populates="conversations")
# --- Pydantic response models for API ---

from pydantic import BaseModel

class OptionRead(BaseModel):
    id: int
    text: str
    is_correct: bool

    class Config:
        from_attributes = True

class QuestionRead(BaseModel):
    id: int
    text: str
    order: int
    quiz_id: int
    options: list[OptionRead]

    class Config:
        from_attributes = True
# --- Gamification Models ---

class Quiz(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    description: str | None = None

    questions: List["Question"] = Relationship(back_populates="quiz")


class Question(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    text: str
    order: int
    quiz_id: int = Field(foreign_key="quiz.id")
    
    quiz: Quiz = Relationship(back_populates="questions")
    options: List["Option"] = Relationship(back_populates="question")
    feedback: "Feedback" = Relationship(back_populates="question")


class Option(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    text: str
    is_correct: bool = Field(default=False)
    question_id: int = Field(foreign_key="question.id")

    question: Question = Relationship(back_populates="options")


class Feedback(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    text: str
    question_id: int = Field(foreign_key="question.id", unique=True)

    question: Question = Relationship(back_populates="feedback")
