import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";

const Transfer = () => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [activeTab, setActiveTab] = useState("transfer"); // transfer or withdraw

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axiosInstance.get(`/account/accounts/${user.id}`);
      setAccounts(res.data.accounts);
    } catch (error) {
      toast.error("Failed to load accounts");
    }
  };

  const receiverAccountNumber = watch("receiverAccountNumber");

  const searchReceiverAccount = async () => {
    if (!receiverAccountNumber || receiverAccountNumber.trim().length === 0) {
      toast.error("Please enter an account number");
      return;
    }

    setSearching(true);
    try {
      const res = await axiosInstance.get(`/account/search/${receiverAccountNumber}`);
      setSearchResults(res.data.account);
      setSelectedReceiver(res.data.account);
      toast.success("Account found!");
    } catch (error) {
      setSearchResults(null);
      setSelectedReceiver(null);
      toast.error(error.response?.data?.message || "Account not found");
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = async (data) => {
    if (activeTab === "transfer") {
      if (!selectedReceiver) {
        toast.error("Please search and select a receiver account");
        return;
      }

      setLoading(true);
      try {
        await axiosInstance.post("/transactions/transfer", {
          senderAccountId: data.senderAccountId,
          receiverAccountId: selectedReceiver._id,
          amount: parseFloat(data.amount),
          description: data.description || "Transfer",
        });

        toast.success("✅ Transfer successful!");
        reset();
        setSelectedReceiver(null);
        setSearchResults(null);
        setActiveTab("transfer");
      } catch (error) {
        toast.error(error.response?.data?.message || "Transfer failed");
      } finally {
        setLoading(false);
      }
    } else {
      // Withdraw
      setLoading(true);
      try {
        await axiosInstance.post("/transactions/withdraw", {
          accountId: data.senderAccountId,
          amount: parseFloat(data.amount),
          description: data.description || "Withdrawal",
        });

        toast.success("✅ Withdrawal successful!");
        reset();
        setActiveTab("withdraw");
      } catch (error) {
        toast.error(error.response?.data?.message || "Withdrawal failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "calc(100vh - 60px)" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>Money Operations</h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Transfer funds or make withdrawals</p>
      </div>

      {/* Tab Buttons */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => {
            setActiveTab("transfer");
            reset();
            setSelectedReceiver(null);
            setSearchResults(null);
          }}
          style={{
            padding: "12px 24px",
            backgroundColor: activeTab === "transfer" ? "#2563eb" : "white",
            color: activeTab === "transfer" ? "white" : "#6b7280",
            border: activeTab === "transfer" ? "none" : "1px solid #e5e7eb",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          💳 Transfer
        </button>
        <button
          onClick={() => {
            setActiveTab("withdraw");
            reset();
          }}
          style={{
            padding: "12px 24px",
            backgroundColor: activeTab === "withdraw" ? "#2563eb" : "white",
            color: activeTab === "withdraw" ? "white" : "#6b7280",
            border: activeTab === "withdraw" ? "none" : "1px solid #e5e7eb",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s"
          }}
        >
          💰 Withdraw
        </button>
      </div>

      {/* Form */}
      <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", maxWidth: "600px" }}>
        {activeTab === "transfer" ? (
          <>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>Send Money</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#111827" }}>From Account</label>
                <select
                  {...register("senderAccountId", { required: "Select sender account" })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                >
                  <option value="">-- Select Account --</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountNumber} - ₹{acc.balance}
                    </option>
                  ))}
                </select>
                {errors.senderAccountId && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.senderAccountId.message}</p>}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#111827" }}>Recipient Account Number</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    {...register("receiverAccountNumber", { required: "Receiver account number required" })}
                    placeholder="e.g. ACC1703000001"
                    style={{ flex: 1, padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                  />
                  <button
                    type="button"
                    onClick={searchReceiverAccount}
                    disabled={searching || !receiverAccountNumber}
                    style={{ padding: "10px 20px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", opacity: searching || !receiverAccountNumber ? 0.5 : 1 }}
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>
                {errors.receiverAccountNumber && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.receiverAccountNumber.message}</p>}
              </div>

              {searchResults && (
                <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #dcfce7", borderRadius: "6px", padding: "12px", marginBottom: "16px" }}>
                  <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>✅ Receiver Account Details:</p>
                  <p style={{ fontWeight: "600", color: "#111827" }}>{searchResults.ownerName}</p>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>Account: {searchResults.accountNumber}</p>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>Type: {searchResults.accountType}</p>
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#111827" }}>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("amount", {
                    required: "Amount is required",
                    min: { value: 0.01, message: "Amount must be greater than 0" },
                  })}
                  placeholder="0.00"
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
                {errors.amount && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.amount.message}</p>}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#111827" }}>Note (optional)</label>
                <textarea
                  {...register("description")}
                  placeholder="What's this for?"
                  rows="3"
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || accounts.length === 0 || !selectedReceiver}
                style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", opacity: loading || accounts.length === 0 || !selectedReceiver ? 0.5 : 1 }}
              >
                {loading ? "Processing..." : "💳 Send Money"}
              </button>
            </form>

            <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "6px", padding: "12px", marginTop: "16px" }}>
              <p style={{ fontSize: "12px", color: "#92400e", fontWeight: "500" }}>⚠️ Important: Double-check the recipient account number. Transfers cannot be reversed.</p>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>Withdraw Cash</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#111827" }}>Select Account</label>
                <select
                  {...register("senderAccountId", { required: "Select account" })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                >
                  <option value="">-- Select Account --</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountNumber} - ₹{acc.balance}
                    </option>
                  ))}
                </select>
                {errors.senderAccountId && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.senderAccountId.message}</p>}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#111827" }}>Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("amount", {
                    required: "Amount is required",
                    min: { value: 0.01, message: "Amount must be greater than 0" },
                  })}
                  placeholder="0.00"
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
                {errors.amount && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.amount.message}</p>}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#111827" }}>Note (optional)</label>
                <textarea
                  {...register("description")}
                  placeholder="Withdrawal reason"
                  rows="3"
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || accounts.length === 0}
                style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", opacity: loading || accounts.length === 0 ? 0.5 : 1 }}
              >
                {loading ? "Processing..." : "💰 Withdraw Cash"}
              </button>
            </form>

            <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "12px", marginTop: "16px" }}>
              <p style={{ fontSize: "12px", color: "#0c2d6b", fontWeight: "500" }}>ℹ️ Withdraw cash from your account. This will be recorded in your transaction history.</p>
            </div>
          </>
        )}
      </div>

      {accounts.length === 0 && (
        <div style={{ backgroundColor: "#eff6ff", borderRadius: "8px", padding: "16px", marginTop: "16px", textAlign: "center" }}>
          <p style={{ color: "#0c2d6b", fontSize: "14px" }}>You don't have any active accounts. Create one first.</p>
        </div>
      )}
    </div>
  );
};

export default Transfer;
