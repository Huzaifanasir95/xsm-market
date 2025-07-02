const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create transporter using Gmail SMTP (same as emailService.js)
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD === 'your_gmail_app_password_here') {
    throw new Error('Email credentials not configured');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

// Send contact form notification to admin
const sendContactNotification = async (formData) => {
  try {
    const transporter = createTransporter();
    
    const { name, email, subject, category, message } = formData;
    
    const mailOptions = {
      from: {
        name: 'XSM Market Contact Form',
        address: process.env.GMAIL_USER
      },
      to: process.env.GMAIL_USER, // Send to admin email
      subject: `[XSM Market Contact] ${category}: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FFD700; font-size: 2.5rem; margin-bottom: 10px;">XSM Market</h1>
              <h2 style="color: #333; margin-bottom: 10px;">New Contact Form Submission</h2>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #FFD700; margin-top: 0;">Contact Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #333; width: 30%;">Name:</td>
                  <td style="padding: 8px 0; color: #666;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
                  <td style="padding: 8px 0; color: #666;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #333;">Category:</td>
                  <td style="padding: 8px 0; color: #666;">${category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #333;">Subject:</td>
                  <td style="padding: 8px 0; color: #666;">${subject}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #FFD700; margin-top: 0;">Message:</h3>
              <p style="color: #333; white-space: pre-wrap; margin: 0;">${message}</p>
            </div>
            
            <div style="background-color: #fffbf0; border: 1px solid #FFD700; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #333;">
                <strong>Reply to:</strong> ${email}<br>
                <strong>Submitted at:</strong> ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending contact notification:', error);
    throw error;
  }
};

// Send auto-reply to user
const sendContactAutoReply = async (formData) => {
  try {
    const transporter = createTransporter();
    
    const { name, email, subject, category } = formData;
    
    // Determine response time based on category
    let responseTime = 'within 24 hours';
    if (category === 'Technical Support') responseTime = 'within 4-8 hours';
    if (category === 'Transaction Support') responseTime = 'within 2 hours';
    if (category === 'Account Issues') responseTime = 'within 4-8 hours';
    
    const mailOptions = {
      from: {
        name: 'XSM Market Support',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: `Re: ${subject} - We received your message`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FFD700; font-size: 2.5rem; margin-bottom: 10px;">XSM Market</h1>
              <h2 style="color: #333; margin-bottom: 10px;">Thank You for Contacting Us!</h2>
            </div>
            
            <p style="color: #333;">Hello ${name},</p>
            
            <p style="color: #333;">
              Thank you for reaching out to us. We have received your message and will respond ${responseTime}.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #FFD700; margin-top: 0;">Your Message Details:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Category:</strong> ${category}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background-color: #fffbf0; border: 1px solid #FFD700; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0;">Expected Response Time:</h4>
              <ul style="margin: 10px 0; color: #666;">
                <li>General inquiries: Within 24 hours</li>
                <li>Technical support: Within 4-8 hours</li>
                <li>Transaction issues: Within 2 hours</li>
                <li>Account issues: Within 4-8 hours</li>
              </ul>
            </div>
            
            <p style="color: #333;">
              In the meantime, you can check our FAQ section or browse our help center for immediate assistance.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; margin: 0;">
                Best regards,<br>
                The XSM Market Support Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending contact auto-reply:', error);
    // Don't throw error for auto-reply failure
    return false;
  }
};

// POST /api/contact/submit - Handle contact form submission
router.post('/submit', async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !category || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    // Validate category
    const validCategories = [
      'General Inquiry',
      'Technical Support',
      'Account Issues',
      'Transaction Support',
      'Report a Problem',
      'Partnership Inquiry',
      'Press/Media',
      'Other'
    ];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    // Check message length
    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long'
      });
    }
    
    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 2000 characters'
      });
    }
    
    const formData = { name, email, subject, category, message };
    
    // Check if email service is configured
    try {
      createTransporter();
    } catch (error) {
      console.error('Email service not configured:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Email service is temporarily unavailable. Please try again later.'
      });
    }
    
    // Send notification to admin
    try {
      await sendContactNotification(formData);
      console.log(`✅ Contact form notification sent for: ${email}`);
    } catch (error) {
      console.error('Failed to send contact notification:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send your message. Please try again later.'
      });
    }
    
    // Send auto-reply to user (don't fail if this doesn't work)
    try {
      await sendContactAutoReply(formData);
      console.log(`✅ Contact auto-reply sent to: ${email}`);
    } catch (error) {
      console.error('Failed to send auto-reply, but continuing...', error);
    }
    
    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.'
    });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
});

// GET /api/contact/status - Check if contact service is available
router.get('/status', (req, res) => {
  try {
    createTransporter();
    res.status(200).json({
      success: true,
      available: true,
      message: 'Contact service is available'
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      available: false,
      message: 'Contact service is temporarily unavailable'
    });
  }
});

module.exports = router;
