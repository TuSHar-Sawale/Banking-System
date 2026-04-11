import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', whiteSpace: 'nowrap', minHeight: '60px' }}>
      {/* Logo */}
      <Link to="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', marginRight: '20px' }}>
        🏦 SecureBank
      </Link>

      {isAuthenticated ? (
        <>
          {/* Navigation */}
          <div style={{ display: 'flex', gap: '20px', flex: 1, fontSize: '14px', whiteSpace: 'nowrap' }}>
            {user?.role === "customer" && (
              <>
                <Link to="/dashboard" style={{ color: '#4b5563', textDecoration: 'none' }}>📊 Dashboard</Link>
                <Link to="/transfer" style={{ color: '#4b5563', textDecoration: 'none' }}>💳 Transfer</Link>
                <Link to="/transactions" style={{ color: '#4b5563', textDecoration: 'none' }}>📋 History</Link>
                <Link to="/loans" style={{ color: '#4b5563', textDecoration: 'none' }}>💰 Loans</Link>
              </>
            )}
            {user?.role === "admin" && (
              <>
                <Link to="/admin" style={{ color: '#4b5563', textDecoration: 'none' }}>📊 Dashboard</Link>
                <Link to="/admin/users" style={{ color: '#4b5563', textDecoration: 'none' }}>👥 Users</Link>
                <Link to="/admin/transactions" style={{ color: '#4b5563', textDecoration: 'none' }}>📋 History</Link>
                <Link to="/admin/loans" style={{ color: '#4b5563', textDecoration: 'none' }}>💼 Admin</Link>
              </>
            )}
          </div>

          {/* User Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '13px' }}>
              <div style={{ width: '28px', height: '28px', backgroundColor: 'white', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span>{user?.role?.charAt(0).toUpperCase()}</span>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
              Logout
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}>Login</Link>
          <Link to="/register" style={{ backgroundColor: '#2563eb', color: 'white', padding: '6px 16px', borderRadius: '4px', textDecoration: 'none', fontSize: '14px' }}>Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
