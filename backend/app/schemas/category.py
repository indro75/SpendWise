from pydantic import BaseModel, Field
from typing import Literal


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    type: Literal["income", "expense"]


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)


class CategoryResponse(BaseModel):
    id: int
    name: str
    type: str
    user_id: int | None

    model_config = {"from_attributes": True}