import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";

const Account = () => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositingId, setDepositingId] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axiosInstance.get(`/account/accounts/${user.id}`);
      setAccounts(res.data.accounts);
    } catch (error) {
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const onCreateAccount = async (data) => {
    setActionLoading(true);
    try {
      await axiosInstance.post("/account/create-account", {
        accountType: data.accountType,
      });
      toast.success("Account created successfully!");
      reset();
      setShowCreateForm(false);
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeposit = async (accountId) => {
    if (!depositAmount || depositAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setActionLoading(true);
    try {
      await axiosInstance.post("/transactions/deposit", {
        accountId,
        amount: parseFloat(depositAmount),
        description: "Deposit",
      });
      toast.success("Deposit successful!");
      setDepositAmount("");
      setDepositingId(null);
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Deposit failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "calc(100vh - 60px)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>My Accounts</h1>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Manage your bank accounts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ padding: "12px 24px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
        >
          {showCreateForm ? "Cancel" : "+ New Account"}
        </button>
      </div>

      {/* Create Account Form */}
      {showCreateForm && (
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", marginBottom: "24px", maxWidth: "500px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Create New Account</h2>
          <form onSubmit={handleSubmit(onCreateAccount)}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#111827" }}>Account Type</label>
              <select
                {...register("accountType", { required: "Account type is required" })}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
              >
                <option value="">-- Select Type --</option>
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="student">Student</option>
              </select>
              {errors.accountType && (
                <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.accountType.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", opacity: actionLoading ? 0.5 : 1 }}
            >
              {actionLoading ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>
      )}

      {/* Accounts Grid */}
      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>
      ) : accounts.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
          {accounts.map((acc) => (
            <div key={acc._id} style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              {/* Account Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px", paddingBottom: "16px", borderBottom: "2px solid #f0f0f0" }}>
                <div>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>🏦</div>
                  <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Account Type</p>
                  <p style={{ fontSize: "16px", fontWeight: "bold" }}>{acc.accountType.toUpperCase()}</p>
                </div>
              </div>

              {/* Account Details */}
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Account Number</p>
                <p style={{ fontSize: "14px", fontWeight: "600", fontFamily: "monospace" }}>{acc.accountNumber}</p>
              </div>

              {/* Balance */}
              <div style={{ backgroundColor: "#f0fdf4", borderRadius: "6px", padding: "12px", marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Current Balance</p>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#16a34a" }}>₹{acc.balance?.toFixed(2) || 0}</p>
              </div>

              {/* Deposit Section */}
              {depositingId === acc._id ? (
                <div style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    step="0.01"
                    style={{ flex: 1, padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px" }}
                  />
                  <button
                    onClick={() => handleDeposit(acc._id)}
                    disabled={actionLoading}
                    style={{ padding: "8px 12px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600", opacity: actionLoading ? 0.5 : 1 }}
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => { setDepositingId(null); setDepositAmount(""); }}
                    style={{ padding: "8px 12px", backgroundColor: "#e5e7eb", color: "#111827", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDepositingId(acc._id)}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
                >
                  💳 Deposit Money
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "60px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏦</div>
          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#111827", marginBottom: "8px" }}>No accounts yet</p>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>Create your first account to start banking</p>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{ padding: "12px 24px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
          >
            Create Account
          </button>
        </div>
      )}
    </div>
  );
};

export default Account;
