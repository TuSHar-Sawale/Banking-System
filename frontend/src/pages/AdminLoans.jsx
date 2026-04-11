import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";

const AdminLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPendingLoans();
  }, [page]);

  const fetchPendingLoans = async () => {
    try {
      const res = await axiosInstance.get("/admin/loans/pending", {
        params: { page, limit: 20 },
      });
      setLoans(res.data.loans);
    } catch (error) {
      toast.error("Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLoan = async (loanId) => {
    try {
      await axiosInstance.put(`/admin/loans/${loanId}`, {
        action: "approve",
      });
      toast.success("Loan approved successfully!");
      fetchPendingLoans();
    } catch (error) {
      toast.error("Failed to approve loan");
    }
  };

  const handleRejectLoan = async (loanId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await axiosInstance.put(`/admin/loans/${loanId}`, {
        action: "reject",
        reason,
      });
      toast.success("Loan rejected successfully!");
      fetchPendingLoans();
    } catch (error) {
      toast.error("Failed to reject loan");
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Loans</h1>

      {/* Loans Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : loans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Principal</th>
                  <th>Interest Rate</th>
                  <th>Term (Months)</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan._id}>
                    <td>
                      <div>
                        <p className="font-semibold">{loan.userId?.name}</p>
                        <p className="text-sm text-gray-600">{loan.userId?.email}</p>
                      </div>
                    </td>
                    <td className="font-bold">₹{loan.principal?.toFixed(2)}</td>
                    <td>{loan.interestRate}%</td>
                    <td>{loan.term}</td>
                    <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleApproveLoan(loan._id)}
                          className="text-green-600 hover:underline font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLoan(loan._id)}
                          className="text-red-600 hover:underline font-semibold"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            No pending loan applications
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLoans;
