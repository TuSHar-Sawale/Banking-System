import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const VerifyEmail = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { verifyEmail, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await verifyEmail(email, data.otp);
      toast.success("Email verified successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      await resendOTP(email);
      toast.success("OTP resent successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 mb-4">Please register first to verify email.</p>
          <Link to="/register" className="btn btn-primary">
            Go to Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-600">Verify Email</h1>
        <p className="text-center text-gray-600 mb-8">An OTP has been sent to {email}</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Enter OTP (6 digits)</label>
            <input
              type="text"
              maxLength="6"
              {...register("otp", {
                required: "OTP is required",
                pattern: { value: /^\d{6}$/, message: "OTP must be 6 digits" },
              })}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
            />
            {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full btn btn-primary disabled:opacity-50">
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Didn't receive OTP?</p>
          <button
            onClick={handleResendOTP}
            disabled={resendLoading}
            className="mt-2 text-blue-600 font-semibold hover:underline disabled:opacity-50"
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
