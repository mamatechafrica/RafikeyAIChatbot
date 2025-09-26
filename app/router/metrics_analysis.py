from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from datetime import datetime, timedelta
from app.models import User, Conversations
from app.core.database import SessionDep

router = APIRouter(
    prefix="/metrics",
    tags=["metrics"]
)

# 1. User Satisfaction Score (USS) - Placeholder
@router.get("/user_satisfaction_score")
def get_user_satisfaction_score():
    """
    Returns the User Satisfaction Score (USS).
    TODO: Implement logic to collect and calculate USS from post-interaction surveys.
    """
    return {"USS": None, "message": "Not implemented. Requires survey data."}

# 2. Time Spent Per Session
@router.get("/time_spent_per_session")
def get_time_spent_per_session(session: SessionDep):
    """
    Returns the average time spent per session (in minutes), using a 30-minute inactivity timeout to split sessions.
    For each thread_id, messages are sorted by timestamp. If the gap between consecutive messages exceeds 30 minutes,
    a new sub-session is started. The duration of each sub-session is (last message - first message).
    Sessions with only one message are excluded.
    """
    from collections import defaultdict

    # Fetch all conversations, grouped by thread_id
    conversations = session.exec(
        select(Conversations.thread_id, Conversations.timestamp)
        .order_by(Conversations.thread_id, Conversations.timestamp)
    ).all()

    # Group messages by thread_id
    threads = defaultdict(list)
    for thread_id, timestamp in conversations:
        threads[thread_id].append(timestamp)

    session_durations = []
    SESSION_TIMEOUT_MINUTES = 30

    for timestamps in threads.values():
        if not timestamps:
            continue
        # Split into sub-sessions based on inactivity timeout
        sub_session_start = timestamps[0]
        last_time = timestamps[0]
        for t in timestamps[1:]:
            gap = (t - last_time).total_seconds() / 60
            if gap > SESSION_TIMEOUT_MINUTES:
                # End current sub-session
                if last_time > sub_session_start:
                    duration = (last_time - sub_session_start).total_seconds() / 60
                    if duration > 0:
                        session_durations.append(duration)
                # Start new sub-session
                sub_session_start = t
            last_time = t
        # Add the last sub-session
        if last_time > sub_session_start:
            duration = (last_time - sub_session_start).total_seconds() / 60
            if duration > 0:
                session_durations.append(duration)

    if not session_durations:
        return {"average_time_spent_minutes": 0, "sessions_count": 0}
    avg_time = sum(session_durations) / len(session_durations)
    return {
        "average_time_spent_minutes": avg_time,
        "sessions_count": len(session_durations)
    }

# 3. Engagement Rate
@router.get("/engagement_rate")
def get_engagement_rate(session: SessionDep):
    """
    Returns the percentage of sessions with at least 3 chatbot responses.
    """
    threads = session.exec(
        select(Conversations.thread_id, func.count(Conversations.id))
        .group_by(Conversations.thread_id)
    ).all()
    if not threads:
        return {"engagement_rate": 0}
    engaged = sum(1 for _, count in threads if count >= 3)
    engagement_rate = (engaged / len(threads)) * 100
    return {"engagement_rate": engagement_rate}

# 4. Message Completion Rate
@router.get("/message_completion_rate")
def get_message_completion_rate(session: SessionDep):
    """
    Returns the percentage of conversations that successfully provide a response before the user exits.
    """
    total = session.exec(select(func.count(Conversations.id))).one()
    completed = session.exec(
        select(func.count(Conversations.id)).where(Conversations.bot_response != None)
    ).one()
    if total == 0:
        return {"message_completion_rate": 0}
    rate = (completed / total) * 100
    return {"message_completion_rate": rate}

# 5. Net Promoter Score (NPS) - Placeholder
@router.get("/nps")
def get_nps():
    """
    Returns the Net Promoter Score (NPS).
    TODO: Implement logic to collect and calculate NPS from user surveys.
    """
    return {"NPS": None, "message": "Not implemented. Requires NPS survey data."}

# 6. User Retention Rate (7-day & 30-day)
@router.get("/user_retention_rate")
def get_user_retention_rate(session: SessionDep):
    """
    Returns the 7-day and 30-day user retention rates.
    """
    now = datetime.utcnow()
    users = session.exec(select(User)).all()
    if not users:
        return {"7_day_retention": 0, "30_day_retention": 0}
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)
    retained_7 = 0
    retained_30 = 0
    for user in users:
        # Find if user has a conversation after their first + 7/30 days
        first = session.exec(
            select(func.min(Conversations.timestamp)).where(Conversations.user_id == user.id)
        ).one()
        if not first:
            continue
        after_7 = session.exec(
            select(Conversations).where(
                Conversations.user_id == user.id,
                Conversations.timestamp >= first + timedelta(days=7)
            )
        ).first()
        after_30 = session.exec(
            select(Conversations).where(
                Conversations.user_id == user.id,
                Conversations.timestamp >= first + timedelta(days=30)
            )
        ).first()
        if after_7:
            retained_7 += 1
        if after_30:
            retained_30 += 1
    total = len(users)
    return {
        "7_day_retention": (retained_7 / total) * 100,
        "30_day_retention": (retained_30 / total) * 100
    }

# 7. Active Monthly Users (AMU)
@router.get("/active_monthly_users")
def get_active_monthly_users(session: SessionDep):
    """
    Returns the number of unique users who interacted with the chatbot in the last 30 days.
    """
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    user_ids = session.exec(
        select(Conversations.user_id)
        .where(Conversations.timestamp >= thirty_days_ago)
        .distinct()
    ).all()
    return {"active_monthly_users": len(user_ids)}

# 8. Referral Rate - Placeholder
@router.get("/referral_rate")
def get_referral_rate():
    """
    Returns the referral rate.
    TODO: Implement logic to track and calculate referrals.
    """
    return {"referral_rate": None, "message": "Not implemented. Requires referral tracking."}

# 9. Drop-off Rate
@router.get("/drop_off_rate")
def get_drop_off_rate(session: SessionDep):
    """
    Returns the percentage of users who abandon conversations before receiving a meaningful response.
    """
    threads = session.exec(
        select(Conversations.thread_id, func.count(Conversations.id), func.max(Conversations.bot_response))
        .group_by(Conversations.thread_id)
    ).all()
    if not threads:
        return {"drop_off_rate": 0}
    dropped = sum(1 for _, _, bot_response in threads if not bot_response)
    drop_off_rate = (dropped / len(threads)) * 100
    return {"drop_off_rate": drop_off_rate}

# 10. Service Finder Usage Rate - Placeholder
@router.get("/service_finder_usage_rate")
def get_service_finder_usage_rate():
    """
    Returns the percentage of users who use the service finder tool.
    TODO: Implement logic to track service finder usage.
    """
    return {"service_finder_usage_rate": None, "message": "Not implemented. Requires service finder usage tracking."}

# 11. Conversion to Services - Placeholder
@router.get("/conversion_to_services")
def get_conversion_to_services():
    """
    Returns the percentage of users who visit a recommended clinic or SRHR service.
    TODO: Implement logic to track conversions.
    """
    return {"conversion_to_services": None, "message": "Not implemented. Requires conversion tracking."}

# 12. Demographic Reach
@router.get("/demographic_reach")
def get_demographic_reach(session: SessionDep):
    """
    Returns demographic breakdown of users.
    """
    total = session.exec(select(func.count(User.id))).one()
    if total == 0:
        return {"demographic_reach": {}}
    # Example: breakdown by gender and age
    genders = session.exec(
        select(User.gender, func.count(User.id)).group_by(User.gender)
    ).all()
    ages = session.exec(
        select(User.age, func.count(User.id)).group_by(User.age)
    ).all()
    return {
        "total_users": total,
        "gender_breakdown": {g: c for g, c in genders},
        "age_breakdown": {a: c for a, c in ages}
    }

# 13. AI Response Accuracy - Placeholder
@router.get("/ai_response_accuracy")
def get_ai_response_accuracy():
    """
    Returns the percentage of chatbot responses validated as accurate.
    TODO: Implement logic for SRHR specialist validation.
    """
    return {"ai_response_accuracy": None, "message": "Not implemented. Requires validation data."}

# 14. AI Training Improvement Rate - Placeholder
@router.get("/ai_training_improvement_rate")
def get_ai_training_improvement_rate():
    """
    Returns the percentage reduction in chatbot errors over time.
    TODO: Implement logic to track errors/misinterpretations.
    """
    return {"ai_training_improvement_rate": None, "message": "Not implemented. Requires error tracking."}

# 15. Cost per User Interaction - Placeholder
@router.get("/cost_per_user_interaction")
def get_cost_per_user_interaction():
    """
    Returns the cost per user interaction.
    TODO: Implement logic to calculate operational costs.
    """
    return {"cost_per_user_interaction": None, "message": "Not implemented. Requires cost data."}

# 16. Technical Uptime & Stability - Placeholder
@router.get("/technical_uptime")
def get_technical_uptime():
    """
    Returns the technical uptime and stability.
    TODO: Integrate with monitoring/uptime data.
    """
    return {"technical_uptime": None, "message": "Not implemented. Requires uptime monitoring."}

# 17. Number of Partner Organizations Integrated - Placeholder
@router.get("/partner_organizations")
def get_partner_organizations():
    """
    Returns the number of partner organizations integrated.
    TODO: Implement logic to track partner organizations.
    """
    return {"partner_organizations": None, "message": "Not implemented. Requires partner org data."}

# 18. Intervention Consolidation Rate - Placeholder
@router.get("/intervention_consolidation_rate")
def get_intervention_consolidation_rate():
    """
    Returns the intervention consolidation rate.
    TODO: Implement logic to track consolidation.
    """
    return {"intervention_consolidation_rate": None, "message": "Not implemented. Requires consolidation data."}

# 19. Cross-Platform Reach - Placeholder
@router.get("/cross_platform_reach")
def get_cross_platform_reach():
    """
    Returns the percentage of users engaging across multiple platforms.
    TODO: Implement logic to track platform usage.
    """
    return {"cross_platform_reach": None, "message": "Not implemented. Requires platform usage data."}

# --- User Rating Submission Endpoint ---
from fastapi import status, HTTPException
from pydantic import BaseModel
from app.models import Rating
from app.router.auth.login import get_current_active_user

class RatingCreate(BaseModel):
    emoji: str
    option: str | None = None

@router.post("/rating", status_code=status.HTTP_201_CREATED)
def submit_rating(
    rating: RatingCreate,
    session: SessionDep,
    current_user=Depends(get_current_active_user)
):
    rating_obj = Rating(
        user_id=current_user.id,
        emoji=rating.emoji,
        option=rating.option
    )
    session.add(rating_obj)
    session.commit()
    session.refresh(rating_obj)
    return {"message": "Rating submitted successfully", "id": rating_obj.id}

