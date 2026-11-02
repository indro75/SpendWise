
from pydantic import BaseModel, Field, model_validator
from datetime import date
from decimal import Decimal


class SavingsGoalCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)

    target_amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2
    )

    current_amount: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        max_digits=12,
        decimal_places=2
    )

    deadline: date | None = None

    @model_validator(mode="after")
    def validate_amounts(self):
        if self.current_amount > self.target_amount:
            raise ValueError(
                "Current amount cannot exceed target amount"
            )
        return self


class SavingsGoalUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=150
    )

    target_amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2
    )

    current_amount: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2
    )

    deadline: date | None = None


class SavingsGoalResponse(BaseModel):
    id: int
    title: str
    target_amount: Decimal
    current_amount: Decimal
    deadline: date | None
    user_id: int

    model_config = {"from_attributes": True}
