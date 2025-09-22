from sqlmodel import Session
from core.database import engine
from models import Quiz, Question, Option, Feedback

def seed_gamification():
    with Session(engine) as session:
        # Create Quiz
        quiz = Quiz(title="Sexual Health Quiz", description="Test your knowledge on sexual health and contraception.")
        session.add(quiz)
        session.commit()
        session.refresh(quiz)

        # 1. Can you get pregnant on your period
        q1 = Question(
            text="Can you get pregnant on your period?",
            order=1,
            quiz_id=quiz.id
        )
        session.add(q1)
        session.commit()
        session.refresh(q1)
        options1 = [
            Option(text="Yes, it possible but unlikely", is_correct=True, question_id=q1.id),
            Option(text="No, it is completely impossible", is_correct=False, question_id=q1.id),
            Option(text="Yes, only if you have sex several times", is_correct=False, question_id=q1.id),
            Option(text="Only if you have sex in doggy style", is_correct=False, question_id=q1.id),
        ]
        session.add_all(options1)
        session.add(Feedback(
            text="Yes. If it’s unprotected vaginal sex during your period, pregnancy can happen but this is very unlikely. This is especially if you have a shorter menstrual cycle (say, 21–24 days) because you could ovulate soon after your period ends. So if you have sex during your period and ovulate a few days later, sperm might still be around to fertilize an egg.That’s why birth control and condoms matter from day one.",
            question_id=q1.id
        ))

        # 2. Does pulling out really work?
        q2 = Question(
            text="Does pulling out really work?",
            order=2,
            quiz_id=quiz.id
        )
        session.add(q2)
        session.commit()
        session.refresh(q2)
        options2 = [
            Option(text="Yes, but it carries a very high risk of unintended pregnancy", is_correct=True, question_id=q2.id),
            Option(text="No, it is 100% ineffective", is_correct=False, question_id=q2.id),
            Option(text="Yes, it has a very low failure rate", is_correct=False, question_id=q2.id),
            Option(text="It only works if the women showers immediately", is_correct=False, question_id=q2.id),
        ]
        session.add_all(options2)
        session.add(Feedback(
            text="It can but it is a very has a very high failure rate. Pre-ejaculate or pre-cum can contain sperm. Condoms or other birth control methods are safer methods.",
            question_id=q2.id
        ))

        # 3. Is it true that condoms reduce pleasure?
        q3 = Question(
            text="Is it true that condoms reduce pleasure?",
            order=3,
            quiz_id=quiz.id
        )
        session.add(q3)
        session.commit()
        session.refresh(q3)
        options3 = [
            Option(text="Yes, they always reduce pleasure", is_correct=False, question_id=q3.id),
            Option(text="No, they only reduce pleasure if the man has a micropenis", is_correct=False, question_id=q3.id),
            Option(text="It depends on factors such as finding the right condom size and partner sexual skills", is_correct=True, question_id=q3.id),
            Option(text="Yes, they reduce pleasure if they are not ribbed", is_correct=False, question_id=q3.id),
        ]
        session.add_all(options3)
        session.add(Feedback(
            text="Not necessarily. With the right fit, texture, partner skills, and lube, condoms can enhance pleasure and reduce anxiety. Plus, they protect against STIs and pregnancy—so you can relax and enjoy.",
            question_id=q3.id
        ))

        # 4. Can you get pregnant if you have anal sex?
        q4 = Question(
            text="Can you get pregnant if you have anal sex?",
            order=4,
            quiz_id=quiz.id
        )
        session.add(q4)
        session.commit()
        session.refresh(q4)
        options4 = [
            Option(text="Yes, there is a very high chance", is_correct=False, question_id=q4.id),
            Option(text="Yes, only if sperm enter the vagina during or after sex", is_correct=True, question_id=q4.id),
            Option(text="It depends on whether the woman is very fertile", is_correct=False, question_id=q4.id),
            Option(text="No, Pregnancy it can never happen", is_correct=False, question_id=q4.id),
        ]
        session.add_all(options4)
        session.add(Feedback(
            text="No you cannot get pregnant from anal sex. However, it can happen if sperm gets near the vaginal opening, especially during cleanup or if fluids mix, there’s a small chance of pregnancy. So it’s not zero-risk.",
            question_id=q4.id
        ))

        # 5. Is birth control only for girls?
        q5 = Question(
            text="Is birth control only for girls?",
            order=5,
            quiz_id=quiz.id
        )
        session.add(q5)
        session.commit()
        session.refresh(q5)
        options5 = [
            Option(text="Yes, only girls use birth control", is_correct=False, question_id=q5.id),
            Option(text="No, there are birth control methods for both men and women", is_correct=True, question_id=q5.id),
            Option(text="Yes, they are the only ones who get pregnant", is_correct=False, question_id=q5.id),
            Option(text="Yes, male birth control methods are ineffective", is_correct=False, question_id=q5.id),
        ]
        session.add_all(options5)
        session.add(Feedback(
            text="No. While many methods are designed for people with ovaries, condoms are for everyone. Plus, guys can support their partners by learning, sharing responsibility, and respecting choices. Also, recently a new hormone-free male bith control pill which works to prevent production of sperm has been approved.",
            question_id=q5.id
        ))

        session.commit()

if __name__ == "__main__":
    seed_gamification()