<p align="center">
  <img src="https://img.shields.io/badge/SpendWise-AI%20Finance-6366F1?style=for-the-badge&logo=sparkles&logoColor=white" alt="SpendWise" />
</p>

<h1 align="center">SpendWise</h1>
<p align="center">
  <strong>AI-Powered Personal Finance Management Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.3-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Scikit--learn-ML-F7931E?style=flat-square&logo=scikit-learn&logoColor=white" alt="Scikit-learn" />
  <img src="https://img.shields.io/badge/Currency-৳_BDT-22C55E?style=flat-square" alt="BDT" />
</p>

<p align="center">
  Track income &amp; expenses · Manage budgets · Monitor savings goals · Analyze financial activity · Predict future spending with machine learning
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [ML Module Setup](#3-ml-module-setup-optional)
- [Demo Account](#-demo-account)
- [API Endpoints](#-api-endpoints)
- [Design System](#-design-system)
- [Application Pages](#-application-pages)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**SpendWise** is a full-stack, AI-powered personal finance management platform built for individuals who want clear visibility into their financial health. It combines a modern React dashboard with a FastAPI backend and machine learning capabilities to deliver:

- **Real-time financial tracking** – Record and categorize every income and expense transaction.
- **Smart budget management** – Set category-specific spending limits with automatic threshold alerts at 80% and 100%.
- **Savings goal tracking** – Create milestones, deposit funds incrementally, and monitor completion deadlines.
- **Interactive analytics** – Visualize monthly cash flows, category breakdowns, and daily expense trends with Recharts.
- **AI-driven insights** – Receive personalized financial summaries, savings recommendations, and spending anomaly detection.
- **Expense prediction** – Forecast next month's expenses using historical spending pattern analysis.

**Default currency:** Bangladeshi Taka (৳ BDT)

---

## 🖼️ Screenshots

> Launch the application and sign in with the demo account to explore all pages.

| Page | Description |
|------|-------------|
| **Login** | Clean authentication with email/password and demo autofill |
| **Dashboard** | Financial overview with stat cards, charts, budgets, and alerts |
| **Transactions** | Full CRUD with search, filters, sorting, and inline editing |
| **Categories** | System defaults + custom user categories with type badges |
| **Budgets** | Category spending limits with progress bars (Safe/Warning/Exceeded) |
| **Savings Goals** | Milestone tracking with quick deposit and deadline monitoring |
| **Analytics** | Monthly comparisons, category pie charts, and daily trend areas |
| **Spending Alerts** | Automated notification center with severity filtering |
| **Expense Prediction** | Historical trend analysis and statistical expense forecasting |
| **Unusual Spending** | Anomaly detection with adjustable sensitivity thresholds |
| **AI Insights** | Personalized financial brief, 50/30/20 model, and savings opportunities |
| **Settings** | Profile, theme toggle, currency display, and API health check |

---

## ✨ Features

### Core Financial Management
- ✅ Add, edit, and delete income & expense transactions
- ✅ Categorize transactions with system defaults and custom categories
- ✅ Search, filter (type, category, date), and sort transactions
- ✅ Create category-specific or global monthly budgets
- ✅ Track budget consumption with color-coded progress bars
- ✅ Set savings goals with target amounts, deadlines, and incremental deposits
- ✅ Mark goals as In Progress, Completed, or Overdue

### Analytics & Visualization
- ✅ Financial summary dashboard (Balance, Income, Expenses, Savings Rate)
- ✅ Monthly income vs. expense bar charts
- ✅ Expense distribution donut charts by category
- ✅ Daily expense trend area charts
- ✅ Recent transaction activity ledger
- ✅ Year and month selector for historical analysis

### AI & Machine Learning
- ✅ Statistical expense prediction based on historical patterns
- ✅ Unusual spending anomaly detection (adjustable sensitivity: 1.4σ / 1.9σ / 2.5σ)
- ✅ Personalized financial health assessment
- ✅ 50/30/20 budget allocation recommendations
- ✅ Savings opportunity identification from category analysis
- ✅ Clear distinction between audited facts and AI-generated suggestions

### Alerts & Notifications
- ✅ Automatic budget threshold alerts (80% warning, 100% exceeded)
- ✅ Severity-based alert filtering (Danger, Warning, Info)
- ✅ Single and bulk alert dismissal
- ✅ Real-time alert count badge in navigation

### Authentication & Security
- ✅ JWT Bearer token authentication
- ✅ User registration with validation
- ✅ Secure password hashing (Argon2)
- ✅ Protected application routes
- ✅ Automatic session expiration handling
- ✅ Password visibility toggle

### User Experience
- ✅ Dark and light theme toggle with persistence
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Collapsible sidebar navigation
- ✅ Toast notifications for all actions
- ✅ Confirmation dialogs before destructive operations
- ✅ Skeleton loading states
- ✅ Empty states with helpful messages
- ✅ Form validation and error feedback
- ✅ Code-split lazy loading for optimal performance

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| [React 19](https://react.dev/) | UI component library |
| [Vite 8](https://vite.dev/) | Build tool and dev server |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS framework |
| [React Router DOM 7](https://reactrouter.com/) | Client-side routing |
| [Axios](https://axios-http.com/) | HTTP client for API communication |
| [Recharts 3](https://recharts.org/) | Composable chart library |
| [Lucide React](https://lucide.dev/) | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| [Python 3.14](https://python.org/) | Server-side language |
| [FastAPI](https://fastapi.tiangolo.com/) | Async web framework |
| [SQLAlchemy](https://sqlalchemy.org/) | ORM and database toolkit |
| [PostgreSQL 16](https://postgresql.org/) | Relational database |
| [python-jose](https://github.com/mpdavis/python-jose) | JWT token encoding/decoding |
| [Passlib + Argon2](https://passlib.readthedocs.io/) | Password hashing |
| [Pydantic](https://docs.pydantic.dev/) | Data validation and serialization |

### Machine Learning
| Technology | Purpose |
|-----------|---------|
| [Pandas](https://pandas.pydata.org/) | Data manipulation |
| [NumPy](https://numpy.org/) | Numerical computations |
| [Scikit-learn](https://scikit-learn.org/) | ML model training and prediction |
| [Joblib](https://joblib.readthedocs.io/) | Model serialization |

---

## 📁 Project Structure

```
spendWise/
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── api/                      # API route handlers
│   │   │   ├── auth.py               # Authentication endpoints
│   │   │   ├── transactions.py       # Transaction CRUD
│   │   │   ├── categories.py         # Category management
│   │   │   ├── budget.py             # Budget CRUD + progress tracking
│   │   │   ├── savings_goals.py      # Savings goals + progress
│   │   │   ├── analytics.py          # Financial analytics
│   │   │   └── spending_alerts.py    # Spending alert management
│   │   ├── core/
│   │   │   ├── dependencies.py       # Auth dependency injection
│   │   │   └── security.py           # JWT + password hashing
│   │   ├── database/
│   │   │   └── connection.py         # SQLAlchemy engine & session
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── services/
│   │   │   └── alert_service.py      # Budget alert automation
│   │   └── main.py                   # FastAPI application entry
│   ├── .env                          # Backend environment variables
│   ├── create_tables.py              # Database table creation
│   ├── seed_categories.py            # Default category seeding
│   ├── requirements.txt              # Python dependencies
│   └── venv/                         # Python virtual environment
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Reusable UI components
│   │   │   │   ├── Button.jsx        # Button variants
│   │   │   │   ├── Input.jsx         # Form inputs
│   │   │   │   ├── Card.jsx          # Card wrapper
│   │   │   │   ├── StatCard.jsx      # Metric stat cards
│   │   │   │   ├── Badge.jsx         # Status badges
│   │   │   │   ├── Modal.jsx         # Modal dialog
│   │   │   │   ├── ConfirmModal.jsx  # Delete confirmation
│   │   │   │   ├── EmptyState.jsx    # Empty data placeholders
│   │   │   │   ├── SkeletonLoader.jsx# Loading skeletons
│   │   │   │   └── ProtectedRoute.jsx# Route guard
│   │   │   └── transactions/
│   │   │       └── TransactionModal.jsx # Add transaction modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Authentication state
│   │   │   ├── ThemeContext.jsx      # Dark/light theme
│   │   │   └── ToastContext.jsx      # Notification toasts
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx        # Sidebar + header layout
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Sign in
│   │   │   ├── Register.jsx          # Create account
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── Transactions.jsx      # Transaction management
│   │   │   ├── Categories.jsx        # Category management
│   │   │   ├── Budgets.jsx           # Budget management
│   │   │   ├── SavingsGoals.jsx      # Savings goals
│   │   │   ├── Analytics.jsx         # Financial analytics
│   │   │   ├── SpendingAlerts.jsx    # Alert center
│   │   │   ├── ExpensePrediction.jsx # AI expense prediction
│   │   │   ├── UnusualSpending.jsx   # Anomaly detection
│   │   │   ├── AiInsights.jsx        # AI financial insights
│   │   │   └── Settings.jsx          # Platform settings
│   │   ├── services/
│   │   │   ├── api.js                # Axios instance + interceptors
│   │   │   ├── auth.js               # Auth API calls
│   │   │   ├── transactions.js       # Transaction API calls
│   │   │   ├── categories.js         # Category API calls
│   │   │   ├── budgets.js            # Budget API calls
│   │   │   ├── savingsGoals.js       # Savings goal API calls
│   │   │   ├── analytics.js          # Analytics API calls
│   │   │   └── spendingAlerts.js     # Alert API calls
│   │   ├── utils/
│   │   │   └── formatters.js         # Currency, date, percentage formatters
│   │   ├── App.jsx                   # Root component with routing
│   │   ├── App.css                   # App-specific styles
│   │   ├── index.css                 # Global styles and design tokens
│   │   └── main.jsx                  # React entry point
│   ├── .env                          # Frontend environment variables
│   ├── index.html                    # HTML template
│   ├── package.json                  # Node.js dependencies
│   └── vite.config.js                # Vite configuration
│
├── ml/                               # Machine Learning Module
│   ├── src/
│   │   ├── data_preprocessing.py     # Data cleaning and preparation
│   │   ├── train.py                  # Model training pipeline
│   │   └── predict.py                # Prediction inference
│   ├── data/                         # Training datasets
│   ├── models/                       # Saved model artifacts
│   ├── notebooks/                    # Jupyter notebooks
│   └── requirements.txt              # ML dependencies
│
├── docs/                             # Documentation
├── .gitignore
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed on your system:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18+ | Frontend runtime |
| **npm** | 9+ | Package manager |
| **Python** | 3.12+ | Backend runtime |
| **PostgreSQL** | 14+ | Database server |

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd D:\Projects\spendWise\backend

# Create and activate virtual environment (if not already created)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt
```

**Configure the database:**

Create a PostgreSQL database named `spendwise_db`, then update the `.env` file:

```env
DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/spendwise_db
SECRET_KEY=change_this_to_a_long_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Initialize the database:**

```powershell
# Create database tables
python create_tables.py

# Seed default categories (Food & Dining, Salary, etc.)
python seed_categories.py
```

**Start the backend server:**

```powershell
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be available at **http://127.0.0.1:8000** with interactive docs at **/docs**.

### 2. Frontend Setup

```powershell
# Navigate to frontend directory
cd D:\Projects\spendWise\frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at **http://localhost:5173**.

**Production build:**

```powershell
npm run build
npm run preview
```

### 3. ML Module Setup (Optional)

```powershell
cd D:\Projects\spendWise\ml

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install ML dependencies
pip install -r requirements.txt
```

> **Note:** The ML prediction pipeline is under active development. The frontend gracefully handles the absence of ML endpoints by displaying historical statistical analysis instead of fabricated data.

---

## 🔑 Demo Account

A pre-seeded demo account is available for quick evaluation:

| Field | Value |
|-------|-------|
| **Email** | `demo@spendwise.com` |
| **Password** | `Password123!` |

> Tip: Click **"Fill with Demo Account"** on the Login page to autofill these credentials.

The demo account includes sample transactions, budgets, and savings goals to fully demonstrate all dashboard features.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login (OAuth2 form) |
| `GET` | `/auth/me` | Get current user profile |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/transactions/` | List all user transactions |
| `POST` | `/transactions/` | Create a new transaction |
| `GET` | `/transactions/{id}` | Get a single transaction |
| `PUT` | `/transactions/{id}` | Update a transaction |
| `DELETE` | `/transactions/{id}` | Delete a transaction |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/categories/` | List system + custom categories |
| `POST` | `/categories/` | Create a custom category |
| `PUT` | `/categories/{id}` | Rename a custom category |
| `DELETE` | `/categories/{id}` | Delete an unused custom category |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/budgets/` | List all budgets |
| `POST` | `/budgets/` | Create a budget |
| `GET` | `/budgets/{id}` | Get a single budget |
| `PUT` | `/budgets/{id}` | Update a budget |
| `DELETE` | `/budgets/{id}` | Delete a budget |
| `GET` | `/budgets/{id}/progress` | Get spending progress |

### Savings Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/savings-goals/` | List all savings goals |
| `POST` | `/savings-goals/` | Create a savings goal |
| `GET` | `/savings-goals/{id}` | Get a single goal |
| `PUT` | `/savings-goals/{id}` | Update a goal |
| `DELETE` | `/savings-goals/{id}` | Delete a goal |
| `GET` | `/savings-goals/{id}/progress` | Get goal progress |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/summary` | Financial summary totals |
| `GET` | `/analytics/monthly?year=` | Monthly income vs expense |
| `GET` | `/analytics/categories?type=` | Category spending breakdown |
| `GET` | `/analytics/recent-transactions?limit=` | Recent transactions |
| `GET` | `/analytics/expense-trends?year=&month=` | Daily expense trends |

### Spending Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/spending-alerts/` | List all alerts |
| `POST` | `/spending-alerts/` | Create an alert |
| `GET` | `/spending-alerts/{id}` | Get a single alert |
| `DELETE` | `/spending-alerts/{id}` | Dismiss an alert |

> All endpoints except `/auth/register` and `/auth/login` require a `Bearer` token in the `Authorization` header.

---

## 🎨 Design System

### Color Palette

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| Primary BG | `#0B0F19` | `#F8FAFC` | Page background |
| Secondary BG | `#111827` | `#FFFFFF` | Sidebar, header |
| Card BG | `#151C2C` | `#FFFFFF` | Card surfaces |
| Border | `#1F293D` | `#E2E8F0` | Subtle borders |
| Primary Text | `#F9FAFB` | `#0F172A` | Headings, body |
| Secondary Text | `#9CA3AF` | `#64748B` | Subtitles, labels |
| Accent | `#6366F1` | `#6366F1` | Buttons, active states |
| Success | `#22C55E` | `#16A34A` | Income, safe status |
| Warning | `#F59E0B` | `#D97706` | Budget warnings |
| Danger | `#EF4444` | `#DC2626` | Expenses, exceeded |

### Typography

- **Primary Font:** Plus Jakarta Sans
- **Fallback:** Inter, system-ui, sans-serif
- **Approach:** Utility-first via Tailwind CSS 4

### Component Library

All UI components are custom-built and reusable:

- `Button` – 6 variants (primary, secondary, outline, danger, success, ghost) with loading states
- `Input` – Form inputs with icons, error messages, and right-side elements
- `Card` – Flexible card wrapper with optional title, subtitle, header actions, and footer
- `StatCard` – Metric display cards with icons and trend badges
- `Badge` – Color-coded status labels (neutral, info, success, warning, danger, income, expense)
- `Modal` – Accessible dialog overlay with keyboard dismissal
- `ConfirmModal` – Pre-built destructive action confirmation
- `EmptyState` – Placeholder for no-data scenarios with optional CTA
- `SkeletonLoader` – Pulse animation placeholders for loading states

---

## 📄 Application Pages

| # | Page | Route | Key Features |
|---|------|-------|--------------|
| 1 | **Dashboard** | `/` | Summary cards, monthly chart, category pie, recent transactions, budget progress, savings overview, alerts, AI prediction card |
| 2 | **Transactions** | `/transactions` | Add/edit/delete, search, multi-filter, sort, inline type toggle |
| 3 | **Categories** | `/categories` | System defaults, custom CRUD, type tabs, protected default enforcement |
| 4 | **Budgets** | `/budgets` | Create/edit/delete, progress tracking, color-coded status bars |
| 5 | **Savings Goals** | `/savings-goals` | Create/edit/delete, quick deposit, status filters, deadline tracking |
| 6 | **Analytics** | `/analytics` | Year selector, bar charts, pie charts, area trends, activity ledger |
| 7 | **Spending Alerts** | `/spending-alerts` | Severity filtering, single/bulk dismiss, auto-generated alerts |
| 8 | **Expense Prediction** | `/expense-prediction` | Historical analysis, statistical forecasting, trend charts |
| 9 | **Unusual Spending** | `/unusual-spending` | Anomaly detection, sensitivity control, flagged transactions |
| 10 | **AI Insights** | `/ai-insights` | Financial health brief, 50/30/20 model, savings recommendations |
| 11 | **Settings** | `/settings` | Profile info, theme toggle, currency display, API health |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/spendwise_db
SECRET_KEY=change_this_to_a_long_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
```

> **Security:** Never commit `.env` files with real credentials. Both `.env` files are listed in `.gitignore`.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Inspect existing API schemas before integrating new endpoints
- Do not overwrite existing backend code
- Keep components reusable and composable
- Write clean, readable code with consistent formatting
- Test API integrations after implementation
- Use the existing design tokens and component library

---

## 📜 License

This project is developed for educational and personal use.

---

<p align="center">
  Built with ❤️ using React, FastAPI, PostgreSQL &amp; Machine Learning
  <br />
  <strong>SpendWise</strong> – Making personal finance simple, visual, intelligent, and accessible.
</p>
