from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.core.middleware import RequestContextMiddleware


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Ensure database schema and default demo tenant exist upon startup."""
    try:
        from uuid import UUID
        from app.db.base import Base
        from app.db.session import engine, SessionLocal
        from app.models.identity import Membership, MembershipRole, Organization, User

        Base.metadata.create_all(bind=engine)

        with SessionLocal() as db:
            demo_org_id = UUID("00000000-0000-0000-0000-000000000001")
            demo_user_id = UUID("00000000-0000-0000-0000-000000000002")

            org = db.get(Organization, demo_org_id)
            if not org:
                org = Organization(
                    id=demo_org_id,
                    name="Acme FinTech Inc.",
                    slug="acme-fintech",
                )
                db.add(org)
                db.flush()

            user = db.get(User, demo_user_id)
            if not user:
                user = User(
                    id=demo_user_id,
                    email="avery@example.com",
                    display_name="Avery Analyst",
                    password_hash="scrypt:demo:hash",
                )
                db.add(user)
                db.flush()

            membership = (
                db.query(Membership)
                .filter_by(user_id=demo_user_id, organization_id=demo_org_id)
                .first()
            )
            if not membership:
                membership = Membership(
                    user_id=demo_user_id,
                    organization_id=demo_org_id,
                    role=MembershipRole.OWNER,
                )
                db.add(membership)
            db.commit()
    except Exception as exc:
        print(f"[WARN] Database initialization notice: {exc}")
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        docs_url="/docs" if settings.environment != "production" else None,
        redoc_url=None,
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
        lifespan=lifespan,
    )
    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )
    register_exception_handlers(app)
    app.include_router(api_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
