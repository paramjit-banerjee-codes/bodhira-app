# 📧 Gmail SMTP Email Verification Setup & Testing Guide

## PART 1: Gmail App Password Generation

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com
2. Click **Security** in the left sidebar
3. Scroll to **How you sign in to Google**
4. Click **2-Step Verification**
5. Follow the prompts to set up 2FA (you'll need your phone)
6. Once complete, return to Security page

### Step 2: Generate App Password
1. In Google Account Security settings, scroll down to **App passwords**
2. You should see a dropdown that says "Select app" and "Select device"
3. In the "Select app" dropdown, choose **Mail**
4. In the "Select device" dropdown, choose **Windows Computer** (or your device)
5. Click **Generate**
6. Google will show a 16-character password like: `abcd efgh ijkl mnop`
7. **Copy this password** (without spaces)

### Step 3: Add to Your .env File
Create or update your `.env` file in the backend folder:

```
# Email Configuration
SMTP_USERNAME=bodhira.app@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
```

⚠️ **Important:**
- Replace `abcdefghijklmnop` with your actual App Password (remove spaces)
- This is NOT your regular Gmail password
- Keep this file private and never commit it to git
- The app password is application-specific and can be revoked anytime

## PART 2: Verify Backend Setup

### Check email configuration is loaded
1. Restart your backend server:
   ```bash
   npm start
   ```
2. In the server console, you should see:
   ```
   ✓ Email service initialized (SMTP ready)
   ```
   or
   ```
   ⚠ Email service skipped (missing SMTP credentials)
   ```

If you see the warning, check:
- `.env` file exists in `/backend` folder
- `SMTP_USERNAME` and `SMTP_PASSWORD` are set
- No typos in the .env file
- Restart the server after updating .env

### Test backend OTP generation
Check that the email service is available by running:
```bash
node -e "const { isEmailServiceAvailable } = require('./src/utils/emailService'); console.log('Email Service Ready:', isEmailServiceAvailable());"
```

## PART 3: End-to-End Testing

### Test Flow 1: Complete Signup → Verify → Login

**Frontend (Client Side):**
1. Navigate to http://localhost:5173/register
2. Fill in the form:
   - Name: `Test User`
   - Email: `test@gmail.com` (use a real Gmail you can access)
   - Password: `password123`
   - Confirm Password: `password123`
   - Role: `Student`
3. Click **Create Account**
4. You should see the OTP Verification page
5. Check your email for the OTP (may take 10-15 seconds)
6. Look for an email from `bodhira.app@gmail.com` with subject: `Your OTP for Bodhira Account Verification`
7. Copy the 6-digit OTP
8. Paste into the verification form
9. The OTP should auto-submit when you enter 6 digits
10. You should see "Email Verified!" message
11. You'll be redirected to login page

**Backend (Server Side) - Check Logs:**
```
POST /api/auth/register
✓ User created with ID: [user_id]
📧 Sending OTP to: test@gmail.com
✓ OTP email sent successfully (messageId: [id])

POST /api/auth/verify-otp
✓ OTP verified successfully
📧 Sending welcome email to: test@gmail.com
✓ Welcome email sent successfully
```

### Test Flow 2: Resend OTP

**If you missed the first OTP:**
1. On the OTP verification page, wait 30 seconds
2. Click **Resend OTP** button
3. Check email again for new OTP
4. Enter the new OTP

**Backend logs:**
```
POST /api/auth/resend-otp
✓ New OTP generated: [6-digit-otp]
✓ OTP email sent successfully
```

### Test Flow 3: OTP Expiry

**Test expired OTP:**
1. Complete signup and go to OTP page
2. Wait 10 minutes (or modify code to test faster)
3. Try to enter an OTP
4. You should see: "OTP has expired. Please request a new one."
5. Click **Resend OTP**

### Test Flow 4: Invalid OTP

**Test with wrong OTP:**
1. On OTP verification page
2. Enter: `000000` (invalid)
3. You should see: "Invalid OTP. Please try again."

**Backend logs:**
```
POST /api/auth/verify-otp
❌ OTP mismatch for email: test@gmail.com
Error: Invalid OTP provided
```

### Test Flow 5: Email Not Found

**Test with wrong email:**
1. Get to OTP page and try:
   - Email: `nonexistent@gmail.com`
   - OTP: `123456`
2. You should see: "User not found"

## PART 4: Common Issues & Solutions

### Issue 1: "Email service skipped - missing SMTP credentials"
**Solution:**
- Verify `.env` file exists in `/backend` folder
- Check spelling: `SMTP_USERNAME` and `SMTP_PASSWORD`
- No spaces around `=` signs
- Restart the server

### Issue 2: "Invalid login" error when sending email
**Solution:**
- You used your regular Gmail password instead of App Password
- Go back to Gmail App Passwords and generate a new one
- Update `.env` with the new App Password (remove spaces)
- Restart server

### Issue 3: Email not arriving (even after 10 seconds)
**Solution:**
- Check spam/promotions folder
- Verify email address in form matches where you're checking
- Check server logs for "OTP email sent successfully"
- Try resending OTP
- If still not working, check Gmail activity log in your Google Account

### Issue 4: "2-Step Verification is not enabled"
**Solution:**
- You MUST enable 2FA before App Passwords appear
- Go to https://myaccount.google.com → Security
- Complete 2-Step Verification setup
- Then generate App Password

### Issue 5: Blank page after clicking "Create Account"
**Solution:**
- Check browser console for errors (F12 → Console tab)
- Check backend terminal for errors
- Ensure backend is running on port 5000
- Try refreshing page and submitting again

## PART 5: Database Verification

### Check that user is created (but unverified)
In MongoDB:
```javascript
// User before verification
{
  "_id": ObjectId(...),
  "name": "Test User",
  "email": "test@gmail.com",
  "isVerified": false,
  "verificationOTP": "[hidden by select:false]",
  "otpExpiresAt": "[hidden by select:false]"
}

// User after verification
{
  "_id": ObjectId(...),
  "name": "Test User",
  "email": "test@gmail.com",
  "isVerified": true,
  "verificationOTP": null,
  "otpExpiresAt": null
}
```

To view hidden fields:
```javascript
db.users.findOne({ email: "test@gmail.com" }, { verificationOTP: 1, otpExpiresAt: 1 })
```

## PART 6: Frontend Email Template Preview

The OTP email sent from Bodhira includes:
- **Header:** Navy blue gradient with Bodhira logo
- **OTP Display:** Large 6-digit code with letter spacing
- **Features Grid:** 4 Bodhira features highlighted
- **Expiry Timer:** "Expires in 10 minutes"
- **Security Warning:** Bold "Never share this code" message
- **Footer:** Support links and copyright

Mobile-responsive design ensures readability on all devices.

## PART 7: Production Deployment Notes

### Before Going Live:
1. ✅ Verify all email flows work in dev
2. ✅ Test with multiple Gmail accounts
3. ✅ Check email delivery times (usually instant)
4. ✅ Verify spam filter settings
5. ✅ Set up monitoring for failed emails
6. ✅ Document App Password for team
7. ✅ Set up email rate limiting (recommended)
8. ✅ Add monitoring logs to track email sends

### Monitoring & Logs:
```bash
# View backend logs with email info
tail -f logs.txt | grep "📧\|OTP\|email"

# Count successful emails sent
grep "✓ OTP email sent" logs.txt | wc -l
```

### Optional Enhancements:
- Add email send retry logic (currently fails silently)
- Implement exponential backoff for resend
- Add analytics: track verify success rate
- Add email whitelist for testing
- Set up Sentry/error tracking for email failures

## PART 8: Quick Checklist

- [ ] Enable 2FA on bodhira.app@gmail.com
- [ ] Generate App Password
- [ ] Copy App Password (remove spaces)
- [ ] Add SMTP_USERNAME to .env
- [ ] Add SMTP_PASSWORD to .env
- [ ] Restart backend server
- [ ] See "Email service initialized" in console
- [ ] Test signup flow
- [ ] Receive OTP email
- [ ] Verify OTP on page
- [ ] See "Email Verified!" message
- [ ] Login with verified account
- [ ] All tests passed ✓

---

## Support

If you encounter issues:
1. Check server logs first
2. Look for email service initialization message
3. Verify .env file is in correct location
4. Test with Gmail account that has 2FA enabled
5. Check Gmail account's connected apps settings
6. Generate new App Password if needed

**Email Service Status:**
- ✅ Email config: `config/email.js`
- ✅ Email templates: `utils/emailTemplates.js`
- ✅ Email functions: `utils/emailService.js`
- ✅ OTP routes: `routes/authRoutes.js`
- ✅ OTP controllers: `controllers/authController.js`
- ✅ Frontend: `pages/VerifyOTP.jsx` + `pages/VerifyOTP.css`
