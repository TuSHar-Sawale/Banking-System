import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/dashboard-stats");
      setStats(res.data.stats);
    } catch (error) {
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Total Users</p>
          <h2 className="text-3xl font-bold">{stats?.users?.total || 0}</h2>
          <p className="text-green-600 text-sm mt-1">{stats?.users?.active || 0} Active</p>
        </div>

        <div className="card bg-green-50 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Total Accounts</p>
          <h2 className="text-3xl font-bold">{stats?.accounts?.total || 0}</h2>
          <p className="text-red-600 text-sm mt-1">{stats?.accounts?.frozen || 0} Frozen</p>
        </div>

        <div className="card bg-purple-50 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Total Balance</p>
          <h2 className="text-2xl font-bold">₹{stats?.accounts?.totalBalance?.toFixed(0) || 0}</h2>
          <p className="text-gray-600 text-sm mt-1">Avg: ₹{stats?.accounts?.averageBalance?.toFixed(0) || 0}</p>
        </div>

        <div className="card bg-orange-50 border-l-4 border-orange-500">
          <p className="text-gray-600 text-sm">Transactions</p>
          <h2 className="text-3xl font-bold">{stats?.transactions?.total || 0}</h2>
          <p className="text-red-600 text-sm mt-1">{stats?.transactions?.suspicious || 0} Suspicious</p>
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Transaction Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Today</span>
              <span className="font-bold">{stats?.transactions?.today || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Volume</span>
              <span className="font-bold">₹{stats?.transactions?.totalVolume?.toFixed(0) || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Transaction</span>
              <span className="font-bold">₹{stats?.transactions?.averageAmount?.toFixed(2) || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4">Loan Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Loans</span>
              <span className="font-bold">{stats?.loans?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Loans</span>
              <span className="font-bold text-green-600">{stats?.loans?.active || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Approval</span>
              <span className="font-bold text-orange-600">{stats?.loans?.pending || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4">Recent Signups</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Last 30 Days</span>
              <span className="font-bold">{stats?.users?.lastMonth || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Status Breakdown</span>
              <span className="font-bold">{stats?.users?.active || 0} Active</span>
            </div>
            <div className="flex justify-between">
              <span></span>
              <span className="font-bold">{stats?.users?.disabled || 0} Disabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a href="/admin/users" className="btn btn-primary text-center">
            Manage Users
          </a>
          <a href="/admin/transactions" className="btn btn-primary text-center">
            Monitor Transactions
          </a>
          <a href="/admin/loans" className="btn btn-primary text-center">
            Approve Loans
          </a>
          <button className="btn btn-secondary disabled:opacity-50">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
