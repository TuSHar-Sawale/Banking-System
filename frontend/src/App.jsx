import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import Account from "./pages/Account";
import Profile from "./pages/Profile";
import Loans from "./pages/Loans";
import AdminPanel from "./pages/AdminPanel";
import AdminUsers from "./pages/AdminUsers";
import AdminTransactions from "./pages/AdminTransactions";
import AdminLoans from "./pages/AdminLoans";

// Components
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

// Context
import { useAuth } from "./context/AuthContext";

const AUTH_ROUTES = ["/login", "/register", "/verify-email"];

function AppLayout() {
  const location = useLocation();
  const hideNavbar = AUTH_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
      <main className="container mx-auto">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Routes - User */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute requiredRole="customer">
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/transfer"
            element={
              <PrivateRoute requiredRole="customer">
                <Transfer />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute requiredRole="customer">
                <Transactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute requiredRole="customer">
                <Account />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute requiredRole="customer">
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/loans"
            element={
              <PrivateRoute requiredRole="customer">
                <Loans />
              </PrivateRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminTransactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/loans"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminLoans />
              </PrivateRoute>
            }
          />

          {/* Redirect unknown routes */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;