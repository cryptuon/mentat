"""Authentication endpoints for web and mobile clients."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status

from src.config import get_settings
from src.middleware.auth import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from src.models.user import User
from src.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse, UserUpdate

router = APIRouter()
settings = get_settings()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Register a new user account.
    Supports wallet-only or email+password registration.
    """
    # Check if wallet already exists
    existing_user = await User.get_or_none(wallet_address=user_data.wallet_address)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet address already registered",
        )

    # Check if email already exists
    if user_data.email:
        existing_email = await User.get_or_none(email=user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    # Hash password if provided
    hashed_password = None
    if user_data.password:
        hashed_password = get_password_hash(user_data.password)

    # Create user
    user = await User.create(
        wallet_address=user_data.wallet_address,
        email=user_data.email,
        hashed_password=hashed_password,
        username=user_data.username,
        display_name=user_data.display_name,
        last_login_at=datetime.utcnow(),
    )

    # Generate token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    user_response = await UserResponse.from_tortoise_orm(user)

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=user_response,
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login with email+password or wallet signature.
    Mobile apps can use wallet-based auth, web can use either.
    """
    user = None

    # Email/password login
    if credentials.email and credentials.password:
        user = await User.get_or_none(email=credentials.email)
        if not user or not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

    # Wallet-based login
    elif credentials.wallet_address:
        user = await User.get_or_none(wallet_address=credentials.wallet_address)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Wallet not registered",
            )
        # TODO: Verify wallet signature
        # For now, we trust the wallet address (signature verification will be added)

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either email+password or wallet_address required",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    # Update last login
    user.last_login_at = datetime.utcnow()
    await user.save()

    # Generate token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    user_response = await UserResponse.from_tortoise_orm(user)

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=user_response,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    return await UserResponse.from_tortoise_orm(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_current_user_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update current user's profile."""
    update_dict = update_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        setattr(current_user, field, value)

    await current_user.save()
    return await UserResponse.from_tortoise_orm(current_user)
