import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [search, role, page]);

  const fetchUsers = async () => {
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (role !== "all") params.role = role;

      const res = await axiosInstance.get("/admin/users", { params });
      setUsers(res.data.users);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}/status`, {
        status: newStatus,
      });
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleViewUser = (userId) => {
    // Could open a modal with user details
    alert(`View user details for: ${userId}`);
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Users</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded"
          />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="font-semibold">{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td className="capitalize">
                      <span className={`badge badge-${user.role === "admin" ? "danger" : "primary"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="capitalize">
                      <span
                        className={`badge badge-${
                          user.status === "active" ? "success" : "danger"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleViewUser(user._id)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                        {user.status === "active" ? (
                          <button
                            onClick={() => handleUpdateStatus(user._id, "disabled")}
                            className="text-red-600 hover:underline"
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(user._id, "active")}
                            className="text-green-600 hover:underline"
                          >
                            Enable
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">No users found</div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
