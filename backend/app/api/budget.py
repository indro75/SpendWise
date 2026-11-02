
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal

from app.database.connection import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User

from app.core.dependencies import get_current_user

from app.schemas.budget import (
    BudgetCreate,
    BudgetUpdate,
    BudgetResponse,
    BudgetProgressResponse
)


router = APIRouter(
    prefix="/budgets",
    tags=["Budget Management"]
)


# Validate category
def validate_category(category_id, user_id, db):
    if category_id is None:
        return

    category = db.query(Category).filter(
        Category.id == category_id,
        Category.type == "expense",
        (Category.user_id == None) | (Category.user_id == user_id)
    ).first()

    if category is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid category. Select an expense category."
        )


# 1. Create Budget
@router.post("/", response_model=BudgetResponse, status_code=201)
def create_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    validate_category(
        budget_data.category_id,
        current_user.id,
        db
    )

    new_budget = Budget(
        amount=budget_data.amount,
        start_date=budget_data.start_date,
        end_date=budget_data.end_date,
        category_id=budget_data.category_id,
        user_id=current_user.id
    )

    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return new_budget


# 2. Get All Budgets
@router.get("/", response_model=list[BudgetResponse])
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id
    ).all()

    return budgets


# 3. Get Single Budget
@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()

    if budget is None:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    return budget


# 4. Update Budget
@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()

    if budget is None:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    update_data = budget_data.model_dump(exclude_unset=True)

    if "category_id" in update_data:
        validate_category(
            update_data["category_id"],
            current_user.id,
            db
        )

    new_start = update_data.get("start_date", budget.start_date)
    new_end = update_data.get("end_date", budget.end_date)

    if new_start is not None and new_end is not None and new_end < new_start:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date"
        )

    for key, value in update_data.items():
        setattr(budget, key, value)

    db.commit()
    db.refresh(budget)

    return budget


# 5. Delete Budget
@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()

    if budget is None:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    db.delete(budget)
    db.commit()

    return {
        "message": "Budget deleted successfully"
    }


# 6. Budget Progress Tracking
@router.get(
    "/{budget_id}/progress",
    response_model=BudgetProgressResponse
)
def get_budget_progress(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()

    if budget is None:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    query = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.transaction_date >= budget.start_date,
        Transaction.transaction_date <= budget.end_date
    )

    if budget.category_id is not None:
        query = query.filter(
            Transaction.category_id == budget.category_id
        )

    spent = Decimal(str(query.scalar()))
    budget_amount = Decimal(str(budget.amount))

    remaining = budget_amount - spent

    percentage = float(
        (spent / budget_amount) * 100
    )

    if percentage >= 100:
        status_text = "Exceeded"
    elif percentage >= 80:
        status_text = "Warning"
    else:
        status_text = "Safe"

    return {
        "id": budget.id,
        "amount": budget_amount,
        "spent_amount": spent,
        "remaining_amount": remaining,
        "percentage_used": round(percentage, 2),
        "status": status_text,
        "start_date": budget.start_date,
        "end_date": budget.end_date,
        "category_id": budget.category_id
    }
