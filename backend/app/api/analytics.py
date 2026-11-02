
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from decimal import Decimal

from app.database.connection import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.user import User
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/analytics",
    tags=["Financial Analytics"]
)


# 1. Financial Summary
@router.get("/summary")
def get_financial_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        Transaction.type,
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.user_id == current_user.id
    ).group_by(
        Transaction.type
    ).all()

    total_income = Decimal("0")
    total_expense = Decimal("0")

    for transaction_type, amount in results:
        if transaction_type == "income":
            total_income = Decimal(str(amount))
        elif transaction_type == "expense":
            total_expense = Decimal(str(amount))

    balance = total_income - total_expense

    savings_rate = 0.0

    if total_income > 0:
        savings_rate = float(
            (balance / total_income) * 100
        )

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "savings_rate": round(savings_rate, 2)
    }


# 2. Monthly Analytics
@router.get("/monthly")
def get_monthly_analytics(
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        extract("month", Transaction.transaction_date).label("month"),
        Transaction.type,
        func.coalesce(func.sum(Transaction.amount), 0).label("total")
    ).filter(
        Transaction.user_id == current_user.id,
        extract("year", Transaction.transaction_date) == year
    ).group_by(
        extract("month", Transaction.transaction_date),
        Transaction.type
    ).order_by(
        extract("month", Transaction.transaction_date)
    ).all()

    monthly_data = {}

    for month, transaction_type, total in results:
        month_number = int(month)

        if month_number not in monthly_data:
            monthly_data[month_number] = {
                "income": Decimal("0"),
                "expense": Decimal("0")
            }

        monthly_data[month_number][transaction_type] = Decimal(str(total))

    return [
        {
            "month": f"{month:02d}",
            "income": values["income"],
            "expense": values["expense"]
        }
        for month, values in sorted(monthly_data.items())
    ]


# 3. Category Analytics
@router.get("/categories")
def get_category_analytics(
    type: str = "expense",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        Category.name,
        func.coalesce(func.sum(Transaction.amount), 0).label("total")
    ).join(
        Transaction,
        Transaction.category_id == Category.id
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == type
    ).group_by(
        Category.name
    ).order_by(
        func.sum(Transaction.amount).desc()
    ).all()

    grand_total = sum(
        (Decimal(str(total)) for _, total in results),
        Decimal("0")
    )

    category_data = []

    for category_name, total in results:
        total = Decimal(str(total))

        percentage = 0.0

        if grand_total > 0:
            percentage = float(
                (total / grand_total) * 100
            )

        category_data.append({
            "category_name": category_name,
            "total_amount": total,
            "percentage": round(percentage, 2)
        })

    return category_data


# 4. Recent Transactions
@router.get("/recent-transactions")
def get_recent_transactions(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = db.query(
        Transaction,
        Category.name.label("category_name")
    ).outerjoin(
        Category,
        Transaction.category_id == Category.id
    ).filter(
        Transaction.user_id == current_user.id
    ).order_by(
        Transaction.transaction_date.desc(),
        Transaction.id.desc()
    ).limit(
        min(max(limit, 1), 100)
    ).all()

    return [
        {
            "id": transaction.id,
            "title": transaction.title,
            "amount": transaction.amount,
            "type": transaction.type,
            "transaction_date": transaction.transaction_date.isoformat(),
            "category_name": category_name
        }
        for transaction, category_name in transactions
    ]


# 5. Expense Trends
@router.get("/expense-trends")
def get_expense_trends(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        Transaction.transaction_date,
        func.coalesce(func.sum(Transaction.amount), 0).label("total")
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        extract("year", Transaction.transaction_date) == year,
        extract("month", Transaction.transaction_date) == month
    ).group_by(
        Transaction.transaction_date
    ).order_by(
        Transaction.transaction_date
    ).all()

    return [
        {
            "date": transaction_date.isoformat(),
            "total_expense": Decimal(str(total))
        }
        for transaction_date, total in results
    ]
