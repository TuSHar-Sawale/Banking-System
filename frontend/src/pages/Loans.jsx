import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";

const Loans = () => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: { interestRate: 10 },
  });
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loansLoading, setLoansLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [payingEmiLoanId, setPayingEmiLoanId] = useState(null);
  const [emiPaymentAccount, setEmiPaymentAccount] = useState("");

  useEffect(() => {
    fetchLoans();
    fetchAccounts();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await axiosInstance.get(`/loans/user/${user.id}`);
      setLoans(res.data.loans);
    } catch (error) {
      toast.error("Failed to load loans");
    } finally {
      setLoansLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axiosInstance.get(`/account/accounts/${user.id}`);
      setAccounts(res.data.accounts);
    } catch (error) {
      console.error("Failed to load accounts", error);
    }
  };

  const principal = watch("principal");
  const interestRate = watch("interestRate");
  const term = watch("term");

  const calculateEMI = () => {
    if (!principal || !interestRate || !term) return 0;
    const P = parseFloat(principal);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseInt(term);
    if (r === 0) return (P / n).toFixed(2);
    const numerator = P * r * Math.pow(1 + r, n);
    const denominator = Math.pow(1 + r, n) - 1;
    return (numerator / denominator).toFixed(2);
  };

  const totalAmount = principal && term && interestRate ? (parseFloat(calculateEMI()) * parseInt(term)).toFixed(2) : 0;

  const onSubmit = async (data) => {
    const existingLoan = loans.find(l => ["pending", "active"].includes(l.status));
    if (existingLoan && existingLoan._id !== payingEmiLoanId) {
      toast.error("You have an existing pending or active loan.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/loans/apply", {
        principal: parseFloat(data.principal),
        interestRate: parseFloat(data.interestRate),
        term: parseInt(data.term),
      });
      toast.success("Loan application submitted!");
      reset();
      setShowForm(false);
      fetchLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply for loan");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (loanId) => {
    setLoading(true);
    try {
      await axiosInstance.post(`/loans/${loanId}/activate`);
      toast.success("✅ Loan activated! Amount disbursed.");
      fetchLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to activate loan");
    } finally {
      setLoading(false);
    }
  };

  const handlePayEmi = async (loanId) => {
    if (!emiPaymentAccount) {
      toast.error("Please select a payment account");
      return;
    }

    const loan = loans.find(l => l._id === loanId);
    if (!loan) {
      toast.error("Loan not found");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(`/loans/${loanId}/payment`, {
        accountId: emiPaymentAccount,
        amount: parseFloat(loan.emi),
      });
      toast.success("✅ EMI payment successful!");
      setPayingEmiLoanId(null);
      setEmiPaymentAccount("");
      fetchLoans();
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to pay EMI");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#fbbf24",
      approved: "#10b981",
      active: "#2563eb",
      rejected: "#ef4444",
      closed: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "calc(100vh - 60px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>Loans</h1>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Apply and manage your loans</p>
        </div>
        {!showForm && loans.every(l => !["pending", "active"].includes(l.status)) && (
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: "12px 24px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
          >
            + Apply for Loan
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Apply for a Loan</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#111827", fontSize: "13px" }}>Loan Amount (₹)</label>
                <input {...register("principal", { required: "Required" })} type="number" step="1000" min="1000" max="5000000" placeholder="₹1000" style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                {errors.principal && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.principal.message}</p>}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#111827", fontSize: "13px" }}>Interest Rate (%)</label>
                <input {...register("interestRate", { required: "Required" })} type="number" step="0.5" min="5" max="20" placeholder="10%" style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                {errors.interestRate && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.interestRate.message}</p>}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#111827", fontSize: "13px" }}>Term (Months)</label>
                <input {...register("term", { required: "Required" })} type="number" step="1" min="6" max="240" placeholder="12" style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                {errors.term && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.term.message}</p>}
              </div>
            </div>

            {principal && interestRate && term && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "16px", padding: "12px", backgroundColor: "#dbeafe", borderRadius: "6px" }}>
                <div><p style={{ fontSize: "12px", color: "#0c2d6b" }}>Monthly EMI</p><p style={{ fontSize: "18px", fontWeight: "bold", color: "#0c2d6b" }}>₹{calculateEMI()}</p></div>
                <div><p style={{ fontSize: "12px", color: "#0c2d6b" }}>Total Payable</p><p style={{ fontSize: "18px", fontWeight: "bold", color: "#0c2d6b" }}>₹{parseFloat(totalAmount).toLocaleString()}</p></div>
                <div><p style={{ fontSize: "12px", color: "#0c2d6b" }}>Total Interest</p><p style={{ fontSize: "18px", fontWeight: "bold", color: "#0c2d6b" }}>₹{(parseFloat(totalAmount) - parseFloat(principal)).toLocaleString()}</p></div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", opacity: loading ? 0.5 : 1 }}>
                {loading ? "Submitting..." : "Submit Application"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: "12px 24px", backgroundColor: "#e5e7eb", color: "#111827", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loansLoading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>
      ) : loans.length === 0 ? (
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "60px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>💰</div>
          <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>No loans yet</p>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>Apply for a loan to get started</p>
          <button onClick={() => setShowForm(true)} style={{ padding: "12px 24px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
            Apply Now
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {loans.map((loan) => (
            <div key={loan._id} style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                <p style={{ fontWeight: "bold", fontSize: "14px" }}>{loan.loanId}</p>
                <span style={{ backgroundColor: getStatusColor(loan.status), color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600" }}>
                  {loan.status.toUpperCase()}
                </span>
              </div>

              <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #f0f0f0" }}>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Principal</p>
                <p style={{ fontSize: "18px", fontWeight: "bold" }}>₹{loan.principal.toLocaleString()}</p>
              </div>

              {loan.status !== "pending" && (
                <>
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Monthly EMI</p>
                    <p style={{ fontSize: "14px", fontWeight: "600" }}>₹{loan.emi?.toFixed(2) || "N/A"}</p>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Total Payable</p>
                    <p style={{ fontSize: "14px", fontWeight: "600" }}>₹{loan.totalAmount?.toLocaleString() || "N/A"}</p>
                  </div>
                </>
              )}

              {loan.status === "active" && (
                <div style={{ backgroundColor: "#f0fdf4", padding: "10px", borderRadius: "4px", marginBottom: "16px" }}>
                  <p style={{ fontSize: "12px", color: "#065f46", marginBottom: "4px" }}>📊 Remaining: ₹{loan.remainingAmount?.toLocaleString()}</p>
                  <p style={{ fontSize: "12px", color: "#065f46" }}>📅 Next Payment: {loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : "N/A"}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px" }}>
                {loan.status === "approved" && (
                  <button onClick={() => handleActivate(loan._id)} disabled={loading} style={{ flex: 1, padding: "8px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600", opacity: loading ? 0.5 : 1 }}>
                    Activate
                  </button>
                )}
                {loan.status === "active" && (
                  <>
                    {payingEmiLoanId === loan._id ? (
                      <div style={{ flex: 1, display: "flex", gap: "8px" }}>
                        <select
                          value={emiPaymentAccount}
                          onChange={(e) => setEmiPaymentAccount(e.target.value)}
                          style={{ flex: 1, padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px" }}
                        >
                          <option value="">Select Account</option>
                          {accounts.map((acc) => (
                            <option key={acc._id} value={acc._id}>
                              {acc.accountNumber} (₹{acc.balance})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handlePayEmi(loan._id)}
                          disabled={loading || !emiPaymentAccount}
                          style={{ padding: "8px 12px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600", opacity: loading || !emiPaymentAccount ? 0.5 : 1, whiteSpace: "nowrap" }}
                        >
                          Pay
                        </button>
                        <button
                          onClick={() => { setPayingEmiLoanId(null); setEmiPaymentAccount(""); }}
                          style={{ padding: "8px 12px", backgroundColor: "#e5e7eb", color: "#111827", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPayingEmiLoanId(loan._id)}
                        style={{ flex: 1, padding: "8px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                      >
                        Pay EMI ₹{loan.emi?.toFixed(2)}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Loans;
