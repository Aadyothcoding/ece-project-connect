import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

// Debug: Check env variables
console.log("📧 MAIL_USER:", process.env.MAIL_USER);
console.log("🔐 MAIL_PASS:", process.env.MAIL_PASS ? "✓ Loaded" : "❌ MISSING");

// Step 1: Create transporter
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // Step 2: Verify transporter
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Transporter verification failed:", error.message);
    } else {
      console.log("✅ Transporter is ready to send emails");
    }
  });
} catch (err) {
  console.error("❌ Error creating transporter:", err.message);
}

// Send verification email
export const sendVerificationEmail = async (to, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${token}`;

  const mailOptions = {
    from: `"${process.env.PROJECT_NAME}" <${process.env.MAIL_USER}>`,
    to,
    subject: `Verify your ${process.env.PROJECT_NAME} account`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Please verify your email to activate your account:</p>
      <a href="${verifyUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't sign up, you can ignore this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending verification email:", err.message);
  }
};

// Send welcome email
export const sendWelcomeEmail = async (to, name) => {
  const mailOptions = {
    from: `"${process.env.PROJECT_NAME}" <${process.env.MAIL_USER}>`,
    to,
    subject: `Welcome to ${process.env.PROJECT_NAME}!`,
    html: `
      <h2>Welcome, ${name}! 🎉</h2>
      <p>We're excited to have you on board.</p>
      <p>Get started by logging in to your account:</p>
      <a href="${process.env.CLIENT_URL}/login" style="padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Login</a>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending welcome email:", err.message);
  }
};

// Send password reset email
export const sendResetEmail = async (to, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${process.env.PROJECT_NAME}" <${process.env.MAIL_USER}>`,
    to,
    subject: `Reset your ${process.env.PROJECT_NAME} password`,
    html: `
      <h2>Hello ${name},</h2>
      <p>You requested a password reset. Click below to set a new password:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #ffc107; color: black; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link expires in 1 hour. If you didn't request this, just ignore this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Reset email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending reset email:", err.message);
  }
};
