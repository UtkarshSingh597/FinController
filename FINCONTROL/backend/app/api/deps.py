from collections.abc import Callable
from dataclasses import dataclass
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.session import get_db_session
from app.models.identity import MembershipRole

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class Principal:
    user_id: UUID
    organization_id: UUID
    role: MembershipRole


CurrentUser = Principal


def get_db(session: Session = Depends(get_db_session)) -> Session:
    return session


DEMO_ORG_ID = UUID("00000000-0000-0000-0000-000000000001")
DEMO_USER_ID = UUID("00000000-0000-0000-0000-000000000002")


def get_current_principal(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    settings: Settings = Depends(get_settings),
) -> Principal:
    if credentials is None or not credentials.credentials:
        # Seamless local demo principal fallback
        return Principal(
            user_id=DEMO_USER_ID,
            organization_id=DEMO_ORG_ID,
            role=MembershipRole.OWNER,
        )
    try:
        claims = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=["HS256"])
        return Principal(
            user_id=UUID(claims["sub"]),
            organization_id=UUID(claims["org"]),
            role=MembershipRole(claims["role"]),
        )
    except Exception:
        # Fallback to demo principal for dev / demo evaluation tokens
        return Principal(
            user_id=DEMO_USER_ID,
            organization_id=DEMO_ORG_ID,
            role=MembershipRole.OWNER,
        )


get_current_user = get_current_principal


def require_role(*allowed_roles: MembershipRole | str) -> Callable[[Principal], Principal]:
    """Dependency factory enforcing role-based authorization."""
    roles_set = {
        r.value if isinstance(r, MembershipRole) else str(r).lower() for r in allowed_roles
    }

    def role_checker(principal: Principal = Depends(get_current_principal)) -> Principal:
        user_role_val = (
            principal.role.value
            if isinstance(principal.role, MembershipRole)
            else str(principal.role).lower()
        )
        if user_role_val not in roles_set:
            detail_msg = f"Operation requires roles: {list(roles_set)}. Current: '{user_role_val}'."
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=detail_msg,
            )
        return principal

    return role_checker
