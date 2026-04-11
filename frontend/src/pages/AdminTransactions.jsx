import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [minScore, setMinScore] = useState(50);

  useEffect(() => {
    fetchTransactions();
  }, [page, minScore]);

  const fetchTransactions = async () => {
    try {
      const res = await axiosInstance.get("/admin/transactions/suspicious", {
        params: { page, limit: 20, minScore },
      });
      setTransactions(res.data.transactions);
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Monitor Suspicious Transactions</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-4 items-center">
          <label>Fraud Score Threshold:</label>
          <select
            value={minScore}
            onChange={(e) => {
              setMinScore(parseInt(e.target.value));
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            <option value={30}>Low (30+)</option>
            <option value={50}>Medium (50+)</option>
            <option value={70}>High (70+)</option>
            <option value={90}>Critical (90+)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>From</th>
                  <th>Amount</th>
                  <th>Fraud Score</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td className="font-mono text-sm">{tx.transactionId}</td>
                    <td>{tx.senderId?.name}</td>
                    <td className="font-bold">₹{tx.amount?.toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          tx.metadata?.fraudScore > 70
                            ? "badge-danger"
                            : "badge-warning"
                        }`}
                      >
                        {tx.metadata?.fraudScore}
                      </span>
                    </td>
                    <td className="text-sm">{tx.metadata?.flagReason || "High risk pattern"}</td>
                    <td>{new Date(tx.timestamp).toLocaleDateString()}</td>
                    <td>
                      <button className="text-blue-600 hover:underline text-sm">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            No suspicious transactions found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
