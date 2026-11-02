from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.transactions import router as transaction_router
from app.api.auth import router as auth_router
from app.api.categories import router as category_router
from app.api.budget import router as budget_router
from app.api.savings_goals import router as savings_goals_router
from app.api.analytics import router as analytics_router
app = FastAPI(
    title="SpendWise API",
    description="Personal Finance and ML Analytics API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(transaction_router)
app.include_router(category_router)
app.include_router(budget_router)
app.include_router(savings_goals_router)
app.include_router(analytics_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to SpendWise API",
        "status": "Running"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}