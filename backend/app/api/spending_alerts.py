from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.spending_alert import SpendingAlert
from app.models.user import User
from app.schemas.spending_alert import (
    SpendingAlertCreate,
    SpendingAlertResponse
)
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/spending-alerts",
    tags=["Spending Alerts"]
)


# 1. Create Spending Alert
@router.post("/", response_model=SpendingAlertResponse)
def create_alert(
    alert_data: SpendingAlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_alert = SpendingAlert(
        message=alert_data.message,
        severity=alert_data.severity,
        amount=alert_data.amount,
        user_id=current_user.id
    )

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return new_alert


# 2. Get All Spending Alerts
@router.get("/", response_model=list[SpendingAlertResponse])
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(SpendingAlert).filter(
        SpendingAlert.user_id == current_user.id
    ).order_by(
        SpendingAlert.created_at.desc()
    ).all()


# 3. Get Single Spending Alert
@router.get("/{alert_id}", response_model=SpendingAlertResponse)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(SpendingAlert).filter(
        SpendingAlert.id == alert_id,
        SpendingAlert.user_id == current_user.id
    ).first()

    if alert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spending alert not found"
        )

    return alert


# 4. Delete Spending Alert
@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(SpendingAlert).filter(
        SpendingAlert.id == alert_id,
        SpendingAlert.user_id == current_user.id
    ).first()

    if alert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spending alert not found"
        )

    db.delete(alert)
    db.commit()

    return {"message": "Spending alert deleted successfully"}