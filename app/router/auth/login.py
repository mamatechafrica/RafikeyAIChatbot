import os 
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta, datetime, timezone
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Annotated
from jwt.exceptions import InvalidTokenError
from dotenv import load_dotenv
from sqlmodel import Session, select
from ...models import User as UserModel
from ...core.database import SessionDep

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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

# =============== ENDPOINTS ===============

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
