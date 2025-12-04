import nodemailer from 'nodemailer';

let emailTransporter = null;
let initialized = false;

/**
 * Initialize Gmail SMTP transporter
 * Uses App Password for bodhira.app@gmail.com
 */
const initializeEmailService = () => {
  // Validate required environment variables
  const requiredVars = ['SMTP_USERNAME', 'SMTP_PASSWORD'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.warn(
      `⚠️  WARNING: Email service not configured. Missing: ${missing.join(', ')}`
    );
    console.warn('   OTP verification will be disabled until SMTP credentials are added to .env');
    return null;
  }

  try {
    // Create Gmail transporter with App Password
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS (not SSL)
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD, // Use App Password, NOT regular Gmail password
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    console.log('✅ Email service initialized with Gmail SMTP');
    return transporter;
  } catch (error) {
    console.warn('⚠️  Failed to initialize email service:', error.message);
    return null;
  }
};

/**
 * Get email transporter (lazy init)
 */
export const getEmailTransporter = () => {
  // Initialize on first use if not already initialized
  if (!initialized) {
    emailTransporter = initializeEmailService();
    initialized = true;
  }
  return emailTransporter;
};

/**
 * Check if email service is available
 */
export const isEmailServiceAvailable = () => {
  const transporter = getEmailTransporter();
  return transporter !== null;
};

export default { getEmailTransporter, isEmailServiceAvailable };
