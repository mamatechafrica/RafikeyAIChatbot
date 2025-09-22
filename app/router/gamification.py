from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select, Session
from typing import List
from app.models import Quiz, Question, Option, Feedback
from app.core.database import SessionDep

router = APIRouter(
    prefix="/gamification", 
    tags=["Gamification"]
    )


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