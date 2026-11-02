from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, Text
from app.database.connection import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    type = Column(String(20), nullable=False)

    description = Column(Text, nullable=True)
    transaction_date = Column(Date, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)