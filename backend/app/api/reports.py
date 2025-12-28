from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core import deps
from app.schemas.report import DailyReport
from app.services.report_service import ReportService

router = APIRouter(prefix="/api/reports", tags=["reports"])
admin_required = deps.require_role({"admin"})


@router.get("/daily", response_model=DailyReport, dependencies=[Depends(admin_required)])
def daily_report(
    report_date: date | None = Query(default=None, alias="date"),
    db: Session = Depends(deps.get_db_session),
):
    target_date = report_date or date.today()
    return ReportService(db).daily(target_date)
