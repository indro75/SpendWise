from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal
from typing import Literal


class TransactionCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    type: Literal["income", "expense"]
    description: str | None = None
    transaction_date: date
    category_id: int | None = None


class TransactionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=150)
    amount: Decimal | None = Field(
        default=None, gt=0, max_digits=12, decimal_places=2
    )
    type: Literal["income", "expense"] | None = None
    description: str | None = None
    transaction_date: date | None = None
    category_id: int | None = None


class TransactionResponse(BaseModel):
    id: int
    title: str
    amount: Decimal
    type: str
    description: str | None
    transaction_date: date
    user_id: int
    category_id: int | None

    model_config = {"from_attributes": True}