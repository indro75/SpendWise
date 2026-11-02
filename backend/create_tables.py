from app.database.connection import Base, engine
from app.models import (
    User,
    Category,
    Transaction,
    Budget,
    SavingsGoal,
    SpendingAlert
)

Base.metadata.create_all(bind=engine)

print("SpendWise database tables created successfully!")