/**
 * Modern HTML Email Template for OTP Verification
 * Bodhira branding with navy blue theme
 */
export const generateOTPEmailTemplate = (name, otp, expiryMinutes = 10) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Bodhira</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            line-height: 1.6;
            color: #333;
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
        .logo {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        .tagline {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 300;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 24px;
        }
        .message {
            font-size: 15px;
            color: #475569;
            margin-bottom: 32px;
            line-height: 1.7;
        }
        .otp-section {
            background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
            border: 2px solid #3b82f6;
            border-radius: 10px;
            padding: 30px;
            text-align: center;
            margin: 32px 0;
        }
        .otp-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #3b82f6;
            font-weight: 700;
            margin-bottom: 12px;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            color: #1e3a8a;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
            word-spacing: 8px;
            margin: 16px 0;
        }
        .otp-expiry {
            font-size: 13px;
            color: #7c3aed;
            margin-top: 12px;
            font-weight: 500;
        }
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            border-radius: 4px;
            margin: 24px 0;
            font-size: 13px;
            color: #92400e;
        }
        .warning strong {
            display: block;
            margin-bottom: 4px;
        }
        .footer {
            background: #f8fafc;
            padding: 24px 30px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
        }
        .footer-text {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 8px;
        }
        .social-links {
            margin-top: 12px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #3b82f6;
            text-decoration: none;
            font-size: 12px;
        }
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 24px 0;
        }
        .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 32px 0;
        }
        .feature {
            text-align: center;
        }
        .feature-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }
        .feature-text {
            font-size: 13px;
            color: #475569;
            font-weight: 500;
        }
        @media (max-width: 480px) {
            .content {
                padding: 24px 16px;
            }
            .otp-section {
                padding: 20px;
            }
            .otp-code {
                font-size: 28px;
                letter-spacing: 2px;
            }
            .features {
                grid-template-columns: 1fr;
                gap: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🚀 BODHIRA</div>
            <div class="tagline">AI-Powered Mock Test Platform</div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">Hi ${name},</div>
            
            <div class="message">
                Welcome to <strong>Bodhira</strong>! We're excited to have you join our platform. 
                To complete your registration and secure your account, please verify your email address 
                using the code below.
            </div>

            <!-- OTP Section -->
            <div class="otp-section">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-expiry">⏱️ This code expires in ${expiryMinutes} minutes</div>
            </div>

            <!-- Warning -->
            <div class="warning">
                <strong>🔒 Security Notice:</strong>
                Never share this code with anyone. Bodhira staff will never ask for your OTP.
            </div>

            <!-- Features -->
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-text">AI-Generated Tests</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">Performance Analytics</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">👥</div>
                    <div class="feature-text">Classroom Management</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🏆</div>
                    <div class="feature-text">Leaderboards</div>
                </div>
            </div>

            <div class="divider"></div>

            <div class="message">
                If you didn't sign up for Bodhira, you can safely ignore this email. 
                Your account won't be created unless you verify your email.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">© 2025 Bodhira. All rights reserved.</div>
            <div class="footer-text">📧 <strong>${process.env.SMTP_USERNAME || 'support@bodhira.com'}</strong></div>
            <div class="social-links">
                <a href="#">Help Center</a> • 
                <a href="#">Privacy Policy</a> • 
                <a href="#">Terms of Service</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

export default { generateOTPEmailTemplate };
