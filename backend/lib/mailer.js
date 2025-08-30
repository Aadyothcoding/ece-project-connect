import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// --- Environment Variable Check ---
// This block will print an error in your console if any required variables are missing.
const requiredEnvVars = ['SENDGRID_API_KEY', 'SENDER_EMAIL', 'CLIENT_URL'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ FATAL ERROR: Environment variable ${varName} is not set. Email functionality may fail.`);
  }
}

// --- SendGrid Configuration ---
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const PROJECT_NAME = process.env.PROJECT_NAME || "Project Connect SRM";

/**
 * Sends a verification email to a new user.
 * @param {string} to - The recipient's email address.
 * @param {string} name - The recipient's full name.
 * @param {string} token - The unique verification token.
 */
export const sendVerificationEmail = async (to, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${token}`;
  
  const msg = {
    to: to,
    from: SENDER_EMAIL,
    subject: `Verify Your Account | ${PROJECT_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hello ${name},</h2>
        <p>Thank you for signing up! Please verify your email to activate your account:</p>
        <p style="margin: 20px 0;">
          <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Your Email</a>
        </p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Verification email sent successfully to ${to}`);
  } catch (error) {
    console.error('❌ Error sending verification email via SendGrid:', error);
  }
};

/**
 * Sends a welcome email after successful verification.
 * @param {string} to - The recipient's email address.
 * @param {string} name - The recipient's full name.
 */
export const sendWelcomeEmail = async (to, name) => {
  const loginUrl = `${process.env.CLIENT_URL}/login`;
  
  const msg = {
    to: to,
    from: SENDER_EMAIL,
    subject: `Welcome to ${PROJECT_NAME}!`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome, ${name}! 🎉</h2>
        <p>We're excited to have you on board. Your account is now active.</p>
        <p>You can get started by logging in:</p>
        <p style="margin: 20px 0;">
          <a href="${loginUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Your Account</a>
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Welcome email sent successfully to ${to}`);
  } catch (error) {
    console.error('❌ Error sending welcome email via SendGrid:', error);
  }
};

/**
 * Sends a password reset email.
 * @param {string} to - The recipient's email address.
 * @param {string} name - The recipient's full name.
 * @param {string} token - The unique password reset token.
 */
export const sendResetEmail = async (to, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  
  const msg = {
    to: to,
    from: SENDER_EMAIL,
    subject: `Password Reset Request | ${PROJECT_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hello ${name},</h2>
        <p>We received a request to reset your password. Click the link below to set a new one:</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
        </p>
        <p>This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Password reset email sent successfully to ${to}`);
  } catch (error) {
    console.error('❌ Error sending reset email via SendGrid:', error);
  }
};
