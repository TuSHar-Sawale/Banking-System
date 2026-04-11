import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stats, setStats] = useState({ total: 0, deposits: 0, outgoing: 0 });

  useEffect(() => {
    fetchTransactions();
  }, [filter, startDate, endDate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 20 };
      if (filter !== "all") params.type = filter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axiosInstance.get(`/transactions/history/${user.id}`, { params });
      setTransactions(res.data.transactions);

      // Calculate stats
      const deposits = res.data.transactions.filter(t => t.type === "deposit").reduce((sum, t) => sum + t.amount, 0);
      const outgoing = res.data.transactions.filter(t => ["withdraw", "transfer", "loan_payment"].includes(t.type)).reduce((sum, t) => sum + t.amount, 0);

      setStats({
        total: res.data.transactions.length,
        deposits,
        outgoing
      });
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "calc(100vh - 60px)" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>Transaction History</h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>{stats.total} total transactions</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "50px", height: "50px", backgroundColor: "#dbeafe", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
            📊
          </div>
          <div>
            <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "4px" }}>Total Transactions</p>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.total}</p>
          </div>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "50px", height: "50px", backgroundColor: "#dcfce7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
            👤
          </div>
          <div>
            <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "4px" }}>Deposits (this page)</p>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>₹{stats.deposits.toFixed(2)}</p>
          </div>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "50px", height: "50px", backgroundColor: "#fef3c7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
            👤
          </div>
          <div>
            <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "4px" }}>Outgoing (this page)</p>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>₹{stats.outgoing.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "16px", marginBottom: "24px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "14px", cursor: "pointer" }}
        >
          <option value="all">All Types</option>
          <option value="deposit">Deposits</option>
          <option value="withdraw">Withdrawals</option>
          <option value="transfer">Transfers</option>
          <option value="loan_disbursement">Loan Disbursements</option>
          <option value="loan_payment">Loan Payments</option>
        </select>

        <input
          type="text"
          placeholder="dd-mm-yyyy"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "14px" }}
        />

        <input
          type="text"
          placeholder="dd-mm-yyyy"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "14px" }}
        />
      </div>

      {/* Transactions List */}
      <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "40px 20px", minHeight: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {loading ? (
          <p>Loading...</p>
        ) : transactions.length > 0 ? (
          <div style={{ width: "100%" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ textAlign: "left", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Type</th>
                  <th style={{ textAlign: "left", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>From/To</th>
                  <th style={{ textAlign: "left", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px", fontSize: "14px", textTransform: "capitalize" }}>
                      {tx.type === "loan_payment" ? "💳 Loan Payment" : tx.type}
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px", fontWeight: "bold", color: "#16a34a" }}>₹{tx.amount?.toFixed(2)}</td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>
                      {tx.type === "transfer" ? (
                        <span>
                          {tx.senderId?._id === user.id ? "→ " : "← "} {tx.senderId?._id === user.id ? tx.receiverId?.name : tx.senderId?.name}
                        </span>
                      ) : tx.type === "deposit" ? (
                        <span>{tx.description?.includes("Loan") ? "🏦 " : "📥 "}Deposit</span>
                      ) : tx.type === "withdraw" ? (
                        <span>📤 Withdrawal</span>
                      ) : tx.type === "loan_payment" ? (
                        <span>📝 Loan Payment</span>
                      ) : (
                        <span>{tx.description || "Transaction"}</span>
                      )}
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>{new Date(tx.timestamp).toLocaleDateString()}</td>
                    <td style={{ padding: "12px", fontSize: "13px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: tx.status === "completed" ? "#dcfce7" : "#fef3c7",
                        color: tx.status === "completed" ? "#166534" : "#92400e"
                      }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
            <p style={{ fontSize: "16px", fontWeight: "bold", color: "#111827", marginBottom: "8px" }}>No transactions found</p>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
