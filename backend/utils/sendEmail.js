import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email with OTP
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Email Verification - Banking System",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP for email verification is:</p>
        <h3 style="color: #2196F3;">${otp}</h3>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset - Banking System",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below:</p>
        <a href="${resetLink}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link is valid for 1 hour.</p>
        <p>If you didn't request this, please ignore this email and your account will remain unchanged.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Reset link sent successfully" };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
};

// Send transaction confirmation email
export const sendTransactionEmail = async (
  email,
  transactionDetails
) => {
  try {
    const { senderName, receiverName, amount, type, timestamp } =
      transactionDetails;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Transaction Confirmation - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      html: `
        <h2>Transaction Confirmation</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px;"><strong>Transaction Type:</strong></td>
            <td style="padding: 10px;">${type}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px;"><strong>From:</strong></td>
            <td style="padding: 10px;">${senderName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px;"><strong>To:</strong></td>
            <td style="padding: 10px;">${receiverName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px;"><strong>Amount:</strong></td>
            <td style="padding: 10px; color: #4CAF50;">₹${amount}</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>Date & Time:</strong></td>
            <td style="padding: 10px;">${new Date(timestamp).toLocaleString()}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #666;">Thank you for using our banking system.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Transaction email sent successfully" };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
};

// Verify SMTP connection
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log("Email configuration is valid");
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
};
