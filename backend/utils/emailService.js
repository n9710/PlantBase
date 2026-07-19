/**
 * Email Service — PlantBase
 * Handles sending verification and password-reset emails.
 * Uses Nodemailer with configurable transport (console fallback for dev).
 */
const nodemailer = require('nodemailer');

// ---------------------------------------------------------------------------
// Transporter — uses Gmail SMTP if credentials exist, otherwise logs to console
// ---------------------------------------------------------------------------
let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  // Development fallback — prints emails to the terminal
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('\n╔══════════════════════════════════════════╗');
      console.log('║       📧  DEV EMAIL (console mode)       ║');
      console.log('╠══════════════════════════════════════════╣');
      console.log(`║ To:      ${mailOptions.to}`);
      console.log(`║ Subject: ${mailOptions.subject}`);
      console.log('╠══════════════════════════════════════════╣');
      // Extract the link from the HTML
      const linkMatch = mailOptions.html?.match(/href="([^"]+)"/);
      if (linkMatch) console.log(`║ 🔗 Link: ${linkMatch[1]}`);
      console.log('╚══════════════════════════════════════════╝\n');
      return { messageId: 'dev-console' };
    },
  };
  console.log('⚠️  EMAIL_USER / EMAIL_PASS not set — emails will print to console');
}

const FROM = process.env.EMAIL_USER || 'noreply@plantbase.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ---------------------------------------------------------------------------
// Send Verification Email
// ---------------------------------------------------------------------------
const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${FRONTEND_URL}/verify-email/${token}`;

  const html = `
    <div style="font-family:'Inter',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FDFAF4;border-radius:12px;overflow:hidden;border:1px solid #D4C5A9;">
      <div style="background:linear-gradient(135deg,#8DB600,#6B9A00);padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;">🌿 PlantBase</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Plant-Based Marketplace</p>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#2C1A0E;margin:0 0 12px;font-size:22px;">Verify Your Email</h2>
        <p style="color:#6B4C2A;line-height:1.6;margin:0 0 24px;">
          Thanks for signing up! Please verify your email address by clicking the button below.
          This link will expire in <strong>24 hours</strong>.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${verifyUrl}"
             style="display:inline-block;background:#8DB600;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:16px;">
            ✅ Verify Email
          </a>
        </div>
        <p style="color:#999;font-size:12px;margin:24px 0 0;line-height:1.5;">
          If the button doesn't work, copy and paste this link:<br>
          <a href="${verifyUrl}" style="color:#8DB600;word-break:break-all;">${verifyUrl}</a>
        </p>
      </div>
      <div style="background:#F5F0E8;padding:16px 24px;text-align:center;">
        <p style="color:#999;font-size:11px;margin:0;">© ${new Date().getFullYear()} PlantBase. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"PlantBase" <${FROM}>`,
    to,
    subject: '🌿 Verify your PlantBase account',
    html,
  });
};

// ---------------------------------------------------------------------------
// Send Password Reset Email
// ---------------------------------------------------------------------------
const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;

  const html = `
    <div style="font-family:'Inter',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FDFAF4;border-radius:12px;overflow:hidden;border:1px solid #D4C5A9;">
      <div style="background:linear-gradient(135deg,#A0522D,#7A3E1E);padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;">🌿 PlantBase</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Password Reset Request</p>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#2C1A0E;margin:0 0 12px;font-size:22px;">Reset Your Password</h2>
        <p style="color:#6B4C2A;line-height:1.6;margin:0 0 24px;">
          We received a request to reset your password. Click the button below to set a new password.
          This link will expire in <strong>1 hour</strong>.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${resetUrl}"
             style="display:inline-block;background:#A0522D;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:16px;">
            🔐 Reset Password
          </a>
        </div>
        <p style="color:#999;font-size:12px;margin:24px 0 0;line-height:1.5;">
          If you didn't request this, you can safely ignore this email.<br>
          <a href="${resetUrl}" style="color:#A0522D;word-break:break-all;">${resetUrl}</a>
        </p>
      </div>
      <div style="background:#F5F0E8;padding:16px 24px;text-align:center;">
        <p style="color:#999;font-size:11px;margin:0;">© ${new Date().getFullYear()} PlantBase. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"PlantBase" <${FROM}>`,
    to,
    subject: '🔐 Reset your PlantBase password',
    html,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
