
from pydantic import BaseModel, Field, model_validator
from datetime import date
from decimal import Decimal


class BudgetCreate(BaseModel):
    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2
    )
    start_date: date
    end_date: date
    category_id: int | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("End date cannot be before start date")
        return self


class BudgetUpdate(BaseModel):
    amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2
    )
    start_date: date | None = None
    end_date: date | None = None
    category_id: int | None = None


class BudgetResponse(BaseModel):
    id: int
    amount: Decimal
    start_date: date
    end_date: date
    user_id: int
    category_id: int | None

    model_config = {"from_attributes": True}
