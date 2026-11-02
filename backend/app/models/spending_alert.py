from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.connection import Base


class SpendingAlert(Base):
    __tablename__ = "spending_alerts"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String(255), nullable=False)
    severity = Column(String(20), default="info")

    amount = Column(Numeric(12, 2), nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())