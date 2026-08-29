from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import Principal, get_current_principal
from app.core.config import Settings, get_settings
from app.db.session import get_db_session
from app.schemas.auth import CurrentUserResponse, LoginRequest, RegisterRequest, TokenResponse
from app.services.auth import (
    AuthenticationError,
    ConflictError,
    authenticate,
    create_access_token,
    register,
)

router = APIRouter(prefix="/auth")


def token_response(settings: Settings, *, user_id, organization_id, role) -> TokenResponse:  # type: ignore[no-untyped-def]
    return TokenResponse(
        access_token=create_access_token(
            settings, user_id=user_id, organization_id=organization_id, role=role
        )
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_account(
    payload: RegisterRequest,
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> TokenResponse:
    try:
        user, organization, membership = register(session, **payload.model_dump())
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return token_response(
        settings, user_id=user.id, organization_id=organization.id, role=membership.role
    )


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> TokenResponse:
    try:
        user, organization, membership = authenticate(session, **payload.model_dump())
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password."
        ) from exc
    return token_response(
        settings, user_id=user.id, organization_id=organization.id, role=membership.role
    )


@router.get("/me", response_model=CurrentUserResponse)
def current_user(
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
) -> CurrentUserResponse:
    from app.models.identity import Membership, Organization, User

    user = session.get(User, principal.user_id)
    membership = session.scalar(
        select(Membership).where(
            Membership.user_id == principal.user_id,
            Membership.organization_id == principal.organization_id,
        )
    )
    organization = session.get(Organization, principal.organization_id)
    if user is None or membership is None or organization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication is no longer valid."
        )
    return CurrentUserResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        organization_id=organization.id,
        organization_name=organization.name,
        role=membership.role,
    )
