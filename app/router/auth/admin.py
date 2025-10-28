import os
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta, datetime, timezone
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from typing import Annotated
from sqlmodel import Session, select
from ...models import User as UserModel
from ...core.database import SessionDep

# Reuse password hashing logic
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user_by_username(session: Session, username: str):
    statement = select(UserModel).where(UserModel.username == username)
    return session.exec(statement).first()

def get_user_by_email(session: Session, email: str):
    statement = select(UserModel).where(UserModel.email == email)
    return session.exec(statement).first()

def authenticate_admin(session: Session, username: str, password: str):
    user = get_user_by_username(session, username)
    if not user or not user.is_admin:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def create_access_token(data: dict, secret_key: str, algorithm: str, expires_delta: timedelta | None = None):
    import jwt
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt

# Settings
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ADMIN_REGISTRATION_CODE = os.getenv("ADMIN_REGISTRATION_CODE", "admin123")  # Should be set in env

router = APIRouter(
    prefix="/admin",
    tags=["Admin Auth"],
)

# Pydantic models
class AdminRegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    admin_code: str

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id: int | None
    username: str
    email: str
    is_admin: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class RegisterResponse(BaseModel):
    message: str
    admin: AdminResponse

# Admin registration endpoint
@router.post("/register", response_model=RegisterResponse)
async def register_admin(
    admin_data: AdminRegisterRequest,
    session: SessionDep
):
    # Check admin code
    if admin_data.admin_code != ADMIN_REGISTRATION_CODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin registration code"
        )
    # Check if username or email already exists
    if get_user_by_username(session, admin_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    if get_user_by_email(session, admin_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    # Hash password
    hashed_password = get_password_hash(admin_data.password)
    # Create admin user
    new_admin = UserModel(
        username=admin_data.username,
        email=admin_data.email,
        password=hashed_password,
        is_admin=True,
        disabled=False,
        terms_accepted=True,  # Admins must accept terms
        created_at=datetime.utcnow()
    )
    session.add(new_admin)
    session.commit()
    session.refresh(new_admin)
    admin_response = AdminResponse(
        id=new_admin.id,
        username=new_admin.username,
        email=new_admin.email,
        is_admin=new_admin.is_admin,
        created_at=new_admin.created_at
    )
    return RegisterResponse(
        message="Admin registered successfully",
        admin=admin_response
    )

# Admin login endpoint
@router.post("/login", response_model=Token)
async def login_admin(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep
):
    admin = authenticate_admin(session, form_data.username, form_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin.username, "is_admin": True},
        secret_key=SECRET_KEY,
        algorithm=ALGORITHM,
        expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")
@router.get("/list", response_model=list[AdminResponse])
async def list_admins(session: SessionDep):
    """
    List all admin users.
    """
    admins = session.exec(
        select(UserModel).where(UserModel.is_admin == True)
    ).all()
    return [
        AdminResponse(
            id=admin.id,
            username=admin.username,
            email=admin.email,
            is_admin=admin.is_admin,
            created_at=admin.created_at
        )
        for admin in admins
    ]