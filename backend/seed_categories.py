from app.database.connection import SessionLocal
from app.models.category import Category

default_categories = {
    "expense": [
        "Food & Dining",
        "Transportation",
        "Shopping",
        "Bills & Utilities",
        "Education",
        "Healthcare",
        "Entertainment",
        "Groceries",
        "Housing",
        "Personal Care",
        "Other"
    ],
    "income": [
        "Salary",
        "Freelance",
        "Business",
        "Investment",
        "Gift",
        "Other"
    ]
}

db = SessionLocal()

try:
    for category_type, names in default_categories.items():
        for name in names:
            existing = db.query(Category).filter(
                Category.name == name,
                Category.type == category_type,
                Category.user_id == None
            ).first()

            if not existing:
                category = Category(
                    name=name,
                    type=category_type,
                    user_id=None
                )
                db.add(category)

    db.commit()
    print("Default categories created successfully!")

except Exception as e:
    db.rollback()
    print("Error:", e)

finally:
    db.close()