import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { Loader2 } from 'lucide-react';

// Lazy loaded application pages for optimal performance & code splitting
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Transactions = lazy(() => import('./pages/Transactions').then((m) => ({ default: m.Transactions })));
const Categories = lazy(() => import('./pages/Categories').then((m) => ({ default: m.Categories })));
const Budgets = lazy(() => import('./pages/Budgets').then((m) => ({ default: m.Budgets })));
const SavingsGoals = lazy(() => import('./pages/SavingsGoals').then((m) => ({ default: m.SavingsGoals })));
const Analytics = lazy(() => import('./pages/Analytics').then((m) => ({ default: m.Analytics })));
const SpendingAlerts = lazy(() => import('./pages/SpendingAlerts').then((m) => ({ default: m.SpendingAlerts })));
const ExpensePrediction = lazy(() => import('./pages/ExpensePrediction').then((m) => ({ default: m.ExpensePrediction })));
const UnusualSpending = lazy(() => import('./pages/UnusualSpending').then((m) => ({ default: m.UnusualSpending })));
const AiInsights = lazy(() => import('./pages/AiInsights').then((m) => ({ default: m.AiInsights })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] text-gray-400 gap-2">
    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    <span className="text-xs font-medium tracking-wide">Loading view...</span>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Authenticated Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="budgets" element={<Budgets />} />
                  <Route path="savings-goals" element={<SavingsGoals />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="spending-alerts" element={<SpendingAlerts />} />
                  <Route path="expense-prediction" element={<ExpensePrediction />} />
                  <Route path="unusual-spending" element={<UnusualSpending />} />
                  <Route path="ai-insights" element={<AiInsights />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Catch-all Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
