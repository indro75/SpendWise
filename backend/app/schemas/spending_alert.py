from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import Literal


class SpendingAlertCreate(BaseModel):
    message: str = Field(min_length=2, max_length=255)
    severity: Literal["info", "warning", "danger"] = "info"
    amount: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2
    )


class SpendingAlertResponse(BaseModel):
    id: int
    message: str
    severity: str
    amount: Decimal | None
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}