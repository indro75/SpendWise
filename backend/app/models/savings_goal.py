from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey
from app.database.connection import Base


class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)

    target_amount = Column(Numeric(12, 2), nullable=False)
    current_amount = Column(Numeric(12, 2), default=0)

    deadline = Column(Date, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)