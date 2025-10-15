import os 
import jwt
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta, datetime, timezone
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from typing import Annotated
from jwt.exceptions import InvalidTokenError
from dotenv import load_dotenv
from sqlmodel import Session, select
from ...models import User as UserModel
from ...core.database import SessionDep
from fastapi import Body


load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 15
RESET_TOKEN_EXPIRE_MINUTES = 15  # Reset tokens expire in 15 minutes

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER")  # or your email provider
SMTP_PORT = int(os.getenv("SMTP_PORT"))
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")  # App password or email password
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://chat.askrafikey.com/auth/reset-password")  # Your frontend URL

class Token(BaseModel):
    access_token: str 
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

# Pydantic model for user registration
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    age: str | None = None
    gender: str | None = None
    relationship_status: str | None = None
    terms_accepted: bool = True

# Pydantic model for API responses (without password)
class UserResponse(BaseModel):
    id: int | None
    username: str
    email: str
    age: str | None = None
    gender: str | None = None
    relationship_status: str | None = None
    terms_accepted: bool
    disabled: bool
    created_at: datetime

class RegisterResponse(BaseModel):
    message: str
    user: UserResponse

# Password reset models
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class MessageResponse(BaseModel):
    message: str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)

# =============== AUTHENTICATION ===============
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user_by_username(session: Session, username: str) -> UserModel | None:
    statement = select(UserModel).where(UserModel.username == username)
    user = session.exec(statement).first()
    return user

def get_user_by_email(session: Session, email: str) -> UserModel | None:
    statement = select(UserModel).where(UserModel.email == email)
    user = session.exec(statement).first()
    return user

def authenticate_user(session: Session, username: str, password: str):
    user = get_user_by_username(session, username)
    if not user:
        return False 
    if not verify_password(password, user.password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    
    to_encode.update({"exp": expire})   
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_reset_token(email: str) -> str:
    """Create a password reset token"""
    expires_delta = timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta
    
    to_encode = {
        "sub": email,
        "exp": expire,
        "type": "password_reset",
        "jti": secrets.token_urlsafe(32)  # Unique token ID to prevent replay attacks
    }
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_reset_token(token: str) -> str | None:
    """Verify and decode password reset token, return email if valid"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "password_reset":
            return None
            
        return email
    except InvalidTokenError:
        return None

async def get_current_user(
    token: Annotated[str, Depends(oauth_scheme)],
    session: SessionDep
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    
    user = get_user_by_username(session, username=token_data.username)
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(
    current_user: Annotated[UserModel, Depends(get_current_user)]
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# =============== EMAIL HELPER ===============

async def send_password_reset_email(email: str, reset_token: str):
    """
    Send password reset email to user using info@mamatech.co.ke
    """
    try:
        # Create reset URL
        reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        
        # Create email content
        subject = "Password Reset Request - Rafikey"
        
        # HTML email template
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - Rafikey</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #1e5a8e 0%, #4a9fd8 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 40px 20px;">
                <tr>
                    <td align="center" valign="middle">
                        <table width="500" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
                            
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #2ca2b4 0%, #1e5a8e 100%); padding: 30px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">
                                        <span style="display: inline-flex; align-items: center; gap: 8px;">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
                                                <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
                                                <path d="M12 6V12L16 14" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                            </svg>
                                            Rafikey
                                        </span>
                                    </h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="background-color: #f5f7fa; padding: 50px 40px; text-align: center;">
                                    
                                    <!-- Icon -->
                                    <div style="margin-bottom: 30px;">
                                        <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                            <!-- Document -->
                                            <rect x="25" y="15" width="45" height="60" rx="3" fill="#e8f4f8" stroke="#2ca2b4" stroke-width="2"/>
                                            <line x1="33" y1="28" x2="55" y2="28" stroke="#2ca2b4" stroke-width="2" stroke-linecap="round"/>
                                            <line x1="33" y1="38" x2="62" y2="38" stroke="#2ca2b4" stroke-width="2" stroke-linecap="round"/>
                                            <line x1="33" y1="48" x2="58" y2="48" stroke="#2ca2b4" stroke-width="2" stroke-linecap="round"/>
                                            
                                            <!-- Lock -->
                                            <rect x="40" y="55" width="28" height="30" rx="3" fill="#1e5a8e"/>
                                            <path d="M 46 55 V 48 C 46 43 49 40 54 40 C 59 40 62 43 62 48 V 55" stroke="#1e5a8e" stroke-width="3" fill="none"/>
                                            <circle cx="54" cy="68" r="3" fill="white"/>
                                            <line x1="54" y1="71" x2="54" y2="76" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                            
                                            <!-- Sparkles -->
                                            <circle cx="22" cy="25" r="2" fill="#2ca2b4" opacity="0.6"/>
                                            <circle cx="75" cy="30" r="2" fill="#2ca2b4" opacity="0.6"/>
                                            <circle cx="20" cy="60" r="2" fill="#2ca2b4" opacity="0.6"/>
                                            <circle cx="78" cy="55" r="2" fill="#2ca2b4" opacity="0.6"/>
                                        </svg>
                                    </div>
                                    
                                    <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 26px; font-weight: 600;">Reset Password</h2>
                                    
                                    <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">Hello,</p>
                                    
                                    <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                                        Please Click the Button Below to Reset Your Password
                                    </p>
                                    
                                    <!-- CTA Button -->
                                    <div style="margin-bottom: 25px;">
                                        <a href="{reset_url}" style="background: linear-gradient(135deg, #1e5a8e 0%, #2ca2b4 100%); color: #ffffff; padding: 14px 50px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(30, 90, 142, 0.3);">
                                            Reset
                                        </a>
                                    </div>
                                    
                                    <!-- Security Notice -->
                                    <div style="background-color: #e0f2fe; border-left: 4px solid #2ca2b4; padding: 12px 16px; margin: 0 0 20px 0; border-radius: 4px; text-align: left;">
                                        <p style="color: #1e5a8e; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">⏱️ Security Notice</p>
                                        <p style="color: #4b5563; font-size: 13px; line-height: 1.5; margin: 0;">
                                            This link will expire in <strong>15 minutes</strong> for your security.
                                        </p>
                                    </div>
                                    
                                    <!-- Alternative Link -->
                                    <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 8px 0; text-align: left;">
                                        If the button doesn't work, copy and paste this link:
                                    </p>
                                    <p style="color: #2ca2b4; font-size: 12px; word-break: break-all; background-color: #ffffff; padding: 10px; border-radius: 4px; margin: 0 0 20px 0; border: 1px solid #e5e7eb; text-align: left;">
                                        {reset_url}
                                    </p>
                                    
                                    <!-- Ignore Notice -->
                                    <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0 0 12px 0;">
                                        If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                                    </p>
                                    
                                 
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    
        """
        
        # Plain text version (fallback)
        text_body = f"""
        Rafikey - Password Reset Request
        
        Hello,
        
        We received a request to reset the password for your Rafikey account.
        
        To reset your password, please visit this link:
        {reset_url}
        
        This link will expire in 15 minutes for your security.
        
        If you didn't request a password reset, you can safely ignore this email.
        
        For support, contact us at info@Rafikey.co.ke
        
        © 2025 MamaTech. All rights reserved.
        """
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = EMAIL_ADDRESS
        message["To"] = email
        
        # Add both plain text and HTML parts
        text_part = MIMEText(text_body, "plain")
        html_part = MIMEText(html_body, "html")
        
        message.attach(text_part)
        message.attach(html_part)
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Enable TLS encryption
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(message)
        
        print(f"Password reset email sent successfully to {email}")
        
    except Exception as e:
        print(f"Failed to send email to {email}: {str(e)}")
        # Don't raise exception to avoid revealing email sending issues to user
        pass

# =============== ENDPOINTS ===============
# Endpoint to check username and email availability


class AvailabilityRequest(BaseModel):
    username: str
    email: str

class AvailabilityResponse(BaseModel):
    username_taken: bool
    email_taken: bool

@router.post('/check-availability', response_model=AvailabilityResponse)
async def check_availability(
    data: AvailabilityRequest,
    session: SessionDep
):
    """
    Check if username or email is already taken
    """
    username_taken = get_user_by_username(session, data.username) is not None
    email_taken = get_user_by_email(session, data.email) is not None
    return AvailabilityResponse(username_taken=username_taken, email_taken=email_taken)

@router.post('/register', response_model=RegisterResponse)
async def register_user(
    user_data: UserRegister,
    session: SessionDep
):
    """
    Register a new user
    """
    try:
        # Check if username already exists
        existing_user = get_user_by_username(session, user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists
        existing_email = get_user_by_email(session, user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = get_password_hash(user_data.password)
        
        # Create new user
        new_user = UserModel(
            username=user_data.username,
            email=user_data.email,
            password=hashed_password,
            age=user_data.age,
            gender=user_data.gender,
            relationship_status=user_data.relationship_status,
            terms_accepted=user_data.terms_accepted,
            disabled=False
        )
        
        # Save to database
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        # Create response
        user_response = UserResponse(
            id=new_user.id,
            username=new_user.username,
            email=new_user.email,
            age=new_user.age,
            gender=new_user.gender,
            relationship_status=new_user.relationship_status,
            terms_accepted=new_user.terms_accepted,
            disabled=new_user.disabled,
            created_at=new_user.created_at
        )
        
        return RegisterResponse(
            message="User registered successfully",
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during registration: {str(e)}"
        )

@router.post('/token')
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep
):
    """
    Login endpoint to get access token
    """
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")

@router.get("/users/me", response_model=UserResponse)
async def read_users_me(
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """
    Get current user information
    """
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        age=current_user.age,
        gender=current_user.gender,
        relationship_status=current_user.relationship_status,
        terms_accepted=current_user.terms_accepted,
        disabled=current_user.disabled,
        created_at=current_user.created_at
    )

@router.post('/forgot-password', response_model=MessageResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    session: SessionDep
):
    """
    Send password reset email to user
    """
    try:
        # Check if user exists
        user = get_user_by_email(session, request.email)
        
        # Always return success message for security reasons
        # (don't reveal if email exists in system)
        success_message = "If an account with that email exists, you will receive a password reset link."
        
        if user and not user.disabled:
            # Generate reset token
            reset_token = create_reset_token(user.email)
            
            # Send email (implement this function based on your email service)
            await send_password_reset_email(user.email, reset_token)
        
        return MessageResponse(message=success_message)
        
    except Exception as e:
        # Still return success message to avoid revealing system errors
        return MessageResponse(
            message="If an account with that email exists, you will receive a password reset link."
        )

@router.post('/reset-password', response_model=MessageResponse)
async def reset_password(
    request: ResetPasswordRequest,
    session: SessionDep
):
    """
    Reset user password using reset token
    """
    try:
        # Verify the reset token
        email = verify_reset_token(request.token)
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Find user by email
        user = get_user_by_email(session, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )
        
        # Hash new password
        hashed_password = get_password_hash(request.new_password)
        
        # Update user password
        user.password = hashed_password
        session.add(user)
        session.commit()
        
        return MessageResponse(message="Password has been reset successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while resetting password"
        )

@router.post('/change-password', response_model=MessageResponse)
async def change_password(
    current_password: str,
    new_password: str,
    current_user: Annotated[UserModel, Depends(get_current_active_user)],
    session: SessionDep
):
    """
    Change password for authenticated user
    """
    try:
        # Verify current password
        if not verify_password(current_password, current_user.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        hashed_password = get_password_hash(new_password)
        
        # Update password
        current_user.password = hashed_password
        session.add(current_user)
        session.commit()
        
        return MessageResponse(message="Password changed successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while changing password"
        )