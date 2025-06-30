const nodemailer = require('nodemailer');

// Create transporter using Gmail SMTP
const createTransporter = () => {
  // Check if email credentials are available
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD === 'your_gmail_app_password_here') {
    throw new Error('Email credentials not configured');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD // Your Gmail app password
    }
  });
};

// Send OTP verification email
const sendOTPEmail = async (email, otp, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'XSM Market',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: 'Verify Your Email - XSM Market',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FFD700; font-size: 2.5rem; margin-bottom: 10px;">XSM Market</h1>
              <h2 style="color: #333; margin-bottom: 10px;">Email Verification</h2>
              <p style="color: #666;">Welcome ${username}!</p>
            </div>
            
            <p>Your verification code is:</p>
            
            <div style="background-color: #f8f9fa; border: 2px dashed #FFD700; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <div style="font-size: 2rem; font-weight: bold; color: #333; letter-spacing: 5px;">${otp}</div>
            </div>
            
            <p>This code expires in 10 minutes. Never share this code with anyone.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    // Don't throw the error, just log it and return false
    return false;
  }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'XSM Market',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: 'Welcome to XSM Market! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FFD700; font-size: 2.5rem; margin-bottom: 10px;">XSM Market</h1>
              <h2 style="color: #333; margin-bottom: 10px;">Welcome! 🎉</h2>
              <p style="color: #666;">Hello ${username}!</p>
            </div>
            
            <p>Congratulations! Your account has been successfully verified and you're now part of the XSM Market community.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #FFD700; margin-top: 0;">What you can do now:</h3>
              <ul style="margin: 0;">
                <li>🛒 Browse and buy products</li>
                <li>💰 Sell your own items</li>
                <li>💬 Chat securely with other users</li>
                <li>🔒 Use safe payment methods</li>
                <li>⭐ Build your reputation</li>
              </ul>
            </div>
            
            <p>Welcome aboard and happy trading!</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, username) => {
  try {
    const transporter = createTransporter();
    
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: {
        name: 'XSM Market',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: 'Password Reset Request - XSM Market',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FFD700; font-size: 2.5rem; margin-bottom: 10px;">XSM Market</h1>
              <h2 style="color: #333; margin-bottom: 10px;">Password Reset</h2>
              <p style="color: #666;">Hello ${username},</p>
            </div>
            
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; background-color: #FFD700; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset My Password
              </a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link: ${resetLink}</p>
            
            <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};
