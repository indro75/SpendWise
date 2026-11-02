
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal

from app.database.connection import get_db
from app.models.savings_goal import SavingsGoal
from app.models.user import User
from app.core.dependencies import get_current_user

from app.schemas.savings_goal import (
    SavingsGoalCreate,
    SavingsGoalUpdate,
    SavingsGoalResponse
)


router = APIRouter(
    prefix="/savings-goals",
    tags=["Savings Goals"]
)


# 1. Create Savings Goal
@router.post("/", response_model=SavingsGoalResponse, status_code=201)
def create_savings_goal(
    goal_data: SavingsGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_goal = SavingsGoal(
        title=goal_data.title,
        target_amount=goal_data.target_amount,
        current_amount=goal_data.current_amount,
        deadline=goal_data.deadline,
        user_id=current_user.id
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal


# 2. Get All Savings Goals
@router.get("/", response_model=list[SavingsGoalResponse])
def get_savings_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(SavingsGoal).filter(
        SavingsGoal.user_id == current_user.id
    ).all()


# 3. Get Single Savings Goal
@router.get("/{goal_id}", response_model=SavingsGoalResponse)
def get_savings_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if goal is None:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found"
        )

    return goal


# 4. Update Savings Goal
@router.put("/{goal_id}", response_model=SavingsGoalResponse)
def update_savings_goal(
    goal_id: int,
    goal_data: SavingsGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if goal is None:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found"
        )

    update_data = goal_data.model_dump(exclude_unset=True)

    new_target = update_data.get(
        "target_amount",
        goal.target_amount
    )

    new_current = update_data.get(
        "current_amount",
        goal.current_amount
    )

    if new_target is None or new_current is None:
        raise HTTPException(
            status_code=400,
            detail="Target and current amounts cannot be null"
        )

    if new_current > new_target:
        raise HTTPException(
            status_code=400,
            detail="Current amount cannot exceed target amount"
        )

    for key, value in update_data.items():
        setattr(goal, key, value)

    db.commit()
    db.refresh(goal)

    return goal


# 5. Delete Savings Goal
@router.delete("/{goal_id}")
def delete_savings_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if goal is None:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found"
        )

    db.delete(goal)
    db.commit()

    return {
        "message": "Savings goal deleted successfully"
    }


# 6. Savings Goal Progress
@router.get("/{goal_id}/progress")
def get_savings_goal_progress(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if goal is None:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found"
        )

    target = Decimal(str(goal.target_amount))
    current = Decimal(str(goal.current_amount))

    remaining = max(target - current, Decimal("0"))

    percentage = float((current / target) * 100)

    if percentage >= 100:
        status_text = "Completed"
    elif goal.deadline is not None:
        from datetime import date

        if goal.deadline < date.today():
            status_text = "Overdue"
        else:
            status_text = "In Progress"
    else:
        status_text = "In Progress"

    return {
        "id": goal.id,
        "title": goal.title,
        "target_amount": target,
        "current_amount": current,
        "remaining_amount": remaining,
        "percentage_completed": round(percentage, 2),
        "status": status_text,
        "deadline": goal.deadline
    }
