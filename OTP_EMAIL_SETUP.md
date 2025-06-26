# Email OTP Verification Setup Guide

This guide will help you set up email OTP (One-Time Password) verification for user registration using Google SMTP.

## Prerequisites

1. A Gmail account for sending emails
2. Google App Password (you'll need to create this)
3. Backend server running on Node.js

## Step 1: Enable Google App Passwords

1. **Sign in to your Google Account**: Go to https://myaccount.google.com/
2. **Enable 2-Factor Authentication**:
   - Navigate to Security
   - Enable 2-Step Verification if not already enabled
3. **Generate App Password**:
   - Go to Security > 2-Step Verification
   - Scroll down to "App passwords"
   - Click "Select app" and choose "Mail"
   - Click "Select device" and choose "Other" and name it "XSM Market"
   - Click "Generate"
   - **Copy the 16-character password** (you'll need this for the .env file)

## Step 2: Backend Configuration

1. **Install Dependencies** (already done):
   ```bash
   cd backend
   npm install nodemailer
   ```

2. **Environment Variables Setup**:
   Create/update your `backend/.env` file with the following:
   ```env
   # Gmail SMTP Configuration
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   
   # Other existing variables
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

   **Important**: 
   - Replace `your-email@gmail.com` with your actual Gmail address
   - Replace `your-16-character-app-password` with the app password from Step 1
   - Do NOT use your regular Gmail password

## Step 3: Test the Setup

1. **Start the Backend Server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend**:
   ```bash
   npm run dev
   ```

3. **Test Registration**:
   - Navigate to the signup page
   - Fill in the registration form
   - Check your email for the OTP verification code
   - Enter the 6-digit code to complete registration

## Features Implemented

### Backend Features:
- ✅ OTP generation (6-digit random number)
- ✅ OTP expiration (10 minutes)
- ✅ Email service with beautiful HTML templates
- ✅ Registration with email verification
- ✅ OTP resend functionality
- ✅ Welcome email after successful verification
- ✅ Verification status checking

### Frontend Features:
- ✅ OTP verification component with:
  - Auto-focus between input fields
  - Paste support for OTP codes
  - Countdown timer (5 minutes)
  - Resend OTP functionality
  - Error handling and validation
- ✅ Integration with registration flow
- ✅ Responsive design
- ✅ Loading states and user feedback

### API Endpoints:
- `POST /api/auth/register` - Register user (sends OTP)
- `POST /api/auth/verify-otp` - Verify OTP and complete registration
- `POST /api/auth/resend-otp` - Resend OTP to email
- `GET /api/auth/verification-status/:email` - Check verification status
- `POST /api/auth/login` - Login (checks email verification)

## Email Templates

The system includes three beautiful HTML email templates:

1. **OTP Verification Email**: Sent during registration
2. **Welcome Email**: Sent after successful verification
3. **Password Reset Email**: For future password reset functionality

## Security Features

- ✅ OTP expires after 10 minutes
- ✅ OTP is cleared after successful verification
- ✅ Rate limiting on resend (1 minute cooldown)
- ✅ Secure password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation and sanitization

## Troubleshooting

### Common Issues:

1. **"Failed to send verification email"**:
   - Check your Gmail credentials in .env
   - Ensure App Password is correct (16 characters, no spaces)
   - Verify 2FA is enabled on your Google account

2. **"Network error"**:
   - Ensure backend server is running on port 5000
   - Check MongoDB connection

3. **"Invalid or expired OTP"**:
   - OTP expires after 10 minutes
   - Check for typos in the code
   - Try resending OTP

4. **Gmail Blocking Emails**:
   - Check your Gmail "Sent" folder
   - Check recipient's spam folder
   - Ensure you're using App Password, not regular password

### Testing Tips:

1. **Use your own email** for testing
2. **Check spam folder** if emails don't arrive
3. **Monitor backend logs** for email sending status
4. **Test with different email providers** (Gmail, Yahoo, Outlook)

## Environment Variables Reference

```env
# Required for email functionality
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop

# Required for backend
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key
PORT=5000

# Required for frontend URLs in emails
FRONTEND_URL=http://localhost:5173

# Optional: Google OAuth (if using Google Sign-In)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Support

If you encounter any issues:
1. Check the backend console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your Gmail account has 2FA enabled and App Password created
4. Test with a simple email first to verify SMTP connection

The system is now ready for production use with proper email verification!
