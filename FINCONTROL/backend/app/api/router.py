from fastapi import APIRouter

from app.api.routes.alerts import router as alerts_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.anomalies import router as anomalies_router
from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.ingestion import router as ingestion_router
from app.api.routes.investigations import router as investigations_router
from app.api.routes.simulations import router as simulations_router
from app.api.routes.webhooks import router as webhooks_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["system"])
api_router.include_router(auth_router, tags=["authentication"])
api_router.include_router(analytics_router, tags=["analytics"])
api_router.include_router(investigations_router, tags=["investigations"])
api_router.include_router(simulations_router, tags=["simulations"])
api_router.include_router(anomalies_router, tags=["anomalies"])
api_router.include_router(alerts_router, tags=["alerts"])
api_router.include_router(webhooks_router, tags=["webhooks"])
api_router.include_router(ingestion_router, tags=["ingestion"])
