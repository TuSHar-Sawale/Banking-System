import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const summaryRes = await axiosInstance.get(`/account/summary/${user.id}`);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return <div style={{ padding: "24px", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "calc(100vh - 60px)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Here's your financial overview</p>
        </div>
        <Link to="/account" style={{ padding: "12px 24px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", textDecoration: "none" }}>
          + New Account
        </Link>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", borderLeft: "4px solid #f59e0b" }}>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Total Balance</p>
          <p style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>₹{summary?.totalBalance?.toFixed(0) || 0}</p>
          <p style={{ fontSize: "24px" }}>💰</p>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", borderLeft: "4px solid #10b981" }}>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Accounts</p>
          <p style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>{summary?.accountCount || 0}</p>
          <p style={{ fontSize: "24px" }}>🏦</p>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", borderLeft: "4px solid #3b82f6" }}>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Recent Transfers</p>
          <p style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>₹0.00</p>
          <p style={{ fontSize: "24px" }}>👤</p>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", borderLeft: "4px solid #8b5cf6" }}>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Recent Deposits</p>
          <p style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>₹0.00</p>
          <p style={{ fontSize: "24px" }}>💳</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {/* My Accounts */}
        <div style={{ gridColumn: "span 2", backgroundColor: "white", borderRadius: "8px", padding: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>My Accounts</h2>
          {summary?.accounts && summary.accounts.length > 0 ? (
            <div style={{ space: "4" }}>
              {summary.accounts.map((acc) => (
                <div key={acc.accountNumber} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderBottom: "1px solid #f0f0f0" }}>
                  <div>
                    <p style={{ fontSize: "13px", color: "#6b7280" }}>{acc.accountType.toUpperCase()}</p>
                    <p style={{ fontSize: "14px", fontWeight: "600", fontFamily: "monospace" }}>{acc.accountNumber}</p>
                  </div>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: "#16a34a" }}>₹{acc.balance?.toFixed(0) || 0}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>No accounts yet</p>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Quick Actions</h2>
          <div style={{ space: "3" }}>
            <Link to="/transfer" style={{ display: "block", border: "2px solid #e5e7eb", borderRadius: "8px", padding: "16px", textAlign: "center", textDecoration: "none", marginBottom: "12px", transition: "all 0.3s" }}>
              <p style={{ fontSize: "24px", marginBottom: "8px" }}>💳</p>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Transfer</p>
            </Link>

            <Link to="/transactions" style={{ display: "block", border: "2px solid #e5e7eb", borderRadius: "8px", padding: "16px", textAlign: "center", textDecoration: "none", marginBottom: "12px" }}>
              <p style={{ fontSize: "24px", marginBottom: "8px" }}>📋</p>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>History</p>
            </Link>

            <Link to="/profile" style={{ display: "block", border: "2px solid #e5e7eb", borderRadius: "8px", padding: "16px", textAlign: "center", textDecoration: "none" }}>
              <p style={{ fontSize: "24px", marginBottom: "8px" }}>👤</p>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Profile</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
