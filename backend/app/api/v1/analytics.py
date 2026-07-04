from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import DBUser
from app.models.analytics import AnalyticsDashboardResponse
from app.services.analytics_service import AnalyticsService
from app.api.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsDashboardResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    return AnalyticsService.get_dashboard_metrics(db)
