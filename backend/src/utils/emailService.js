import { getEmailTransporter, isEmailServiceAvailable } from '../config/email.js';
import { generateOTPEmailTemplate } from './emailTemplates.js';

/**
 * Generate random 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email via Gmail SMTP
 * @param {string} toEmail - Recipient email address
 * @param {string} name - User's name
 * @param {string} otp - 6-digit OTP code
 * @param {number} expiryMinutes - OTP expiry time in minutes (default: 10)
 * @returns {Promise<boolean>} - true if sent successfully, false otherwise
 */
export const sendOTPEmail = async (toEmail, name, otp, expiryMinutes = 10) => {
  // Implement simple retry with exponential backoff
  const maxAttempts = 3;
  const baseDelay = 500; // ms

  if (!isEmailServiceAvailable()) {
    console.warn('⚠️  Email service not available. OTP not sent.');
    return false;
  }

  const transporter = getEmailTransporter();
  const htmlContent = generateOTPEmailTemplate(name, otp, expiryMinutes);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await transporter.sendMail({
        from: `"Bodhira" <${process.env.SMTP_USERNAME}>`,
        to: toEmail,
        subject: '🔐 Verify Your Email - Bodhira',
        html: htmlContent,
        text: `Your Bodhira verification code is: ${otp}. This code expires in ${expiryMinutes} minutes.`,
      });

      console.log(`✅ OTP email sent successfully to ${toEmail} (attempt ${attempt})`);
      console.log(`   Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      const isLast = attempt === maxAttempts;
      console.error(`❌ Attempt ${attempt} - Failed to send OTP email to ${toEmail}:`, error.message);

      if (process.env.NODE_ENV === 'development') {
        console.error('   Full error:', error);
      }

      if (isLast) {
        return false;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  return false;
};

/**
 * Send welcome email after verification
 * @param {string} toEmail - Recipient email address
 * @param {string} name - User's name
 * @returns {Promise<boolean>} - true if sent successfully, false otherwise
 */
export const sendWelcomeEmail = async (toEmail, name) => {
  try {
    if (!isEmailServiceAvailable()) {
      console.warn('⚠️  Email service not available. Welcome email not sent.');
      return false;
    }

    const transporter = getEmailTransporter();

    const welcomeTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .content {
            padding: 40px 30px;
        }
        .footer {
            background: #f8fafc;
            padding: 24px 30px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 28px; font-weight: 700;">🎉 Welcome to Bodhira!</div>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>Your email has been verified successfully! Your account is now fully activated.</p>
            <p>You're all set to start creating tests, joining classrooms, and tracking your learning progress with Bodhira's AI-powered platform.</p>
            <p style="margin-top: 24px; color: #1e3a8a; font-weight: 600;">Happy learning! 🚀</p>
        </div>
        <div class="footer">
            © 2025 Bodhira. All rights reserved.
        </div>
    </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"Bodhira" <${process.env.SMTP_USERNAME}>`,
      to: toEmail,
      subject: '🎉 Welcome to Bodhira - Account Verified!',
      html: welcomeTemplate,
      text: `Welcome to Bodhira, ${name}! Your account is now fully activated.`,
    });

    console.log(`✅ Welcome email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
    return false;
  }
};

export default { generateOTP, sendOTPEmail, sendWelcomeEmail };
