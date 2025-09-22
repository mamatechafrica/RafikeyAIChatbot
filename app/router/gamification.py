from pydantic import BaseModel
from app.router.auth.login import get_current_active_user
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select, Session
from typing import List
from app.models import Quiz, Question, Option, Feedback
from app.core.database import SessionDep

router = APIRouter(
    prefix="/gamification", 
    tags=["Gamification"]
)

# --- Pydantic models for quiz creation ---

class QuizCreate(BaseModel):
    title: str
    description: str | None = None

class AdminOptionCreate(BaseModel):
    text: str
    is_correct: bool = False

class AdminQuestionCreate(BaseModel):
    text: str
    order: int
    options: list[AdminOptionCreate]
    feedback: str

class AdminQuizCreate(BaseModel):
    title: str
    description: str | None = None
    questions: list[AdminQuestionCreate]

# --- Endpoints ---

@router.get("/quizzes", response_model=List[Quiz])
def get_quizzes(session: SessionDep):
    quizzes = session.exec(select(Quiz)).all()
    return quizzes

@router.get("/quizzes/{quiz_id}/questions", response_model=List[Question])
def get_quiz_questions(quiz_id: int, session: SessionDep):
    quiz = session.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz.questions

@router.get("/questions/{question_id}", response_model=Question)
def get_question(question_id: int, session: SessionDep):
    question = session.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@router.post("/questions/{question_id}/answer")
def submit_answer(question_id: int, selected_option_id: int, session: SessionDep):
    question = session.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    option = session.get(Option, selected_option_id)
    if not option or option.question_id != question_id:
        raise HTTPException(status_code=400, detail="Invalid option for this question")
    feedback = session.exec(select(Feedback).where(Feedback.question_id == question_id)).first()
    return {
        "correct": option.is_correct,
        "feedback": feedback.text if feedback else None
    }

@router.post("/quizzes", response_model=Quiz)
def create_quiz(quiz: QuizCreate, session: SessionDep):
    db_quiz = Quiz(title=quiz.title, description=quiz.description)
    session.add(db_quiz)
    session.commit()
    session.refresh(db_quiz)
    return db_quiz

@router.post("/admin/quizzes", response_model=Quiz)
def admin_create_quiz(
    quiz: AdminQuizCreate,
    session: SessionDep,
    # current_user=Depends(get_current_active_user)
):
    # if not getattr(current_user, "is_admin", False):
    #     raise HTTPException(status_code=403, detail="Not authorized")

    db_quiz = Quiz(title=quiz.title, description=quiz.description)
    session.add(db_quiz)
    session.commit()
    session.refresh(db_quiz)

    for q in quiz.questions:
        db_question = Question(
            text=q.text,
            order=q.order,
            quiz_id=db_quiz.id
        )
        session.add(db_question)
        session.commit()
        session.refresh(db_question)

        for opt in q.options:
            db_option = Option(
                text=opt.text,
                is_correct=opt.is_correct,
                question_id=db_question.id
            )
            session.add(db_option)

        db_feedback = Feedback(
            text=q.feedback,
            question_id=db_question.id
        )
        session.add(db_feedback)
        session.commit()

    return db_quiz