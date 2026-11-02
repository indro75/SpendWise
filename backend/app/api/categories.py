from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.category import Category
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse
)
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


# View system and personal categories
@router.get("/", response_model=list[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Category).filter(
        (Category.user_id == None) |
        (Category.user_id == current_user.id)
    ).order_by(Category.type, Category.name).all()


# Create a custom category
@router.post("/", response_model=CategoryResponse)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Category).filter(
        Category.user_id == current_user.id,
        Category.name.ilike(data.name),
        Category.type == data.type
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="This category already exists"
        )

    category = Category(
        name=data.name.strip(),
        type=data.type,
        user_id=current_user.id
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


# Update a custom category
@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Custom category not found"
        )

    if data.name is not None:
        category.name = data.name.strip()

    db.commit()
    db.refresh(category)

    return category


# Delete a custom category
@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Custom category not found"
        )

    used = db.query(Transaction).filter(
        Transaction.category_id == category_id
    ).first()

    if used:
        raise HTTPException(
            status_code=409,
            detail="This category is used by transactions"
        )

    db.delete(category)
    db.commit()

    return {"message": "Category deleted successfully"}