
from pydantic import BaseModel
from decimal import Decimal


class FinancialSummary(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal
    savings_rate: float


class MonthlyAnalytics(BaseModel):
    month: str
    income: Decimal
    expense: Decimal


class CategoryAnalytics(BaseModel):
    category_name: str
    total_amount: Decimal
    percentage: float


class RecentTransaction(BaseModel):
    id: int
    title: str
    amount: Decimal
    type: str
    transaction_date: str
    category_name: str | None


class ExpenseTrend(BaseModel):
    date: str
    total_expense: Decimal
