import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import axiosInstance from "../api/axios";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("phone", user.phone);
      setValue("street", user.address?.street || "");
      setValue("city", user.address?.city || "");
      setValue("state", user.address?.state || "");
      setValue("zipCode", user.address?.zipCode || "");
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/account/update-profile/${user.id}`, {
        name: data.name,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
      });

      updateUserData(response.data.user);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "calc(100vh - 60px)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>My Profile</h1>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Manage your personal information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{ padding: "12px 24px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
        >
          {isEditing ? "Cancel" : "✏️ Edit"}
        </button>
      </div>

      <div style={{ maxWidth: "600px", backgroundColor: "white", borderRadius: "8px", padding: "40px 24px" }}>
        {/* Avatar Section */}
        <div style={{ textAlign: "center", marginBottom: "32px", paddingBottom: "32px", borderBottom: "2px solid #f0f0f0" }}>
          <div style={{ width: "80px", height: "80px", backgroundColor: "#dbeafe", borderRadius: "50%", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>
            👤
          </div>
          <p style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>{user?.name}</p>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{user?.email}</p>
        </div>

        {!isEditing ? (
          /* View Mode */
          <div>
            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600", marginBottom: "8px" }}>ACCOUNT INFORMATION</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ backgroundColor: "#f9fafb", padding: "12px", borderRadius: "6px" }}>
                  <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Status</p>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#16a34a" }}>✅ {user?.status}</p>
                </div>
                <div style={{ backgroundColor: "#f9fafb", padding: "12px", borderRadius: "6px" }}>
                  <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Email Verified</p>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: user?.isEmailVerified ? "#16a34a" : "#dc2626" }}>
                    {user?.isEmailVerified ? "✅ Yes" : "❌ No"}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600", marginBottom: "6px" }}>FULL NAME</p>
              <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>{user?.name}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600", marginBottom: "6px" }}>PHONE</p>
              <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>{user?.phone}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600", marginBottom: "6px" }}>ADDRESS</p>
              <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                {user?.address?.street}, {user?.address?.city}, {user?.address?.state} {user?.address?.zipCode}
              </p>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#111827", fontSize: "13px" }}>Full Name</label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
              />
              {errors.name && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.name.message}</p>}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#111827", fontSize: "13px" }}>Phone</label>
              <input
                type="tel"
                {...register("phone", { required: "Phone is required" })}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
              />
              {errors.phone && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.phone.message}</p>}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#111827", fontSize: "13px" }}>Street</label>
              <input
                type="text"
                {...register("street")}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>

            <div style={{ marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#111827", fontSize: "13px" }}>City</label>
                <input
                  type="text"
                  {...register("city")}
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#111827", fontSize: "13px" }}>State</label>
                <input
                  type="text"
                  {...register("state")}
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#111827", fontSize: "13px" }}>ZIP Code</label>
              <input
                type="text"
                {...register("zipCode")}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", opacity: loading ? 0.5 : 1 }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
