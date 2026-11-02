from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.spending_alert import SpendingAlert


def check_budget_alerts(db: Session, user_id: int):

    budgets = db.query(Budget).filter(
        Budget.user_id == user_id
    ).all()

    for budget in budgets:

        query = db.query(
            func.coalesce(func.sum(Transaction.amount), 0)
        ).filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.transaction_date >= budget.start_date,
            Transaction.transaction_date <= budget.end_date
        )

        if budget.category_id is not None:
            query = query.filter(
                Transaction.category_id == budget.category_id
            )

        spent = Decimal(str(query.scalar() or 0))

        if budget.amount <= 0:
            continue

        percentage = (spent / budget.amount) * 100

        if percentage >= 100:
            severity = "danger"
            threshold = "100%"

        elif percentage >= 80:
            severity = "warning"
            threshold = "80%"

        else:
            continue

        message = (
            f"Budget #{budget.id} has reached "
            f"the {threshold} spending threshold."
        )

        existing_alert = db.query(SpendingAlert).filter(
            SpendingAlert.user_id == user_id,
            SpendingAlert.message == message
        ).first()

        if existing_alert:
            continue

        new_alert = SpendingAlert(
            message=message,
            severity=severity,
            amount=spent,
            user_id=user_id
        )

        db.add(new_alert)

    db.commit()