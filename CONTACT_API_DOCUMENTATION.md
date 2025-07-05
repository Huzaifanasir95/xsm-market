# Contact API Implementation

## Overview
Implemented a comprehensive contact form API in PHP backend that matches the Node.js backend functionality.

## API Endpoints

### POST /api/contact/submit
Submit a contact form message.

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "subject": "string (required)",
  "category": "string (required, from predefined list)",
  "message": "string (required, 10-2000 characters)"
}
```

**Valid Categories:**
- General Inquiry
- Technical Support
- Account Issues
- Transaction Support
- Report a Problem
- Partnership Inquiry
- Press/Media
- Other

**Success Response (200):**
```json
{
  "success": true,
  "message": "Your message has been sent successfully! We will get back to you soon."
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Error description"
}
```

### GET /api/contact/status
Check if the contact service is available.

**Success Response (200):**
```json
{
  "success": true,
  "available": true,
  "message": "Contact service is available"
}
```

## Features Implemented

1. **Form Validation:**
   - Required field validation
   - Email format validation
   - Category validation
   - Message length validation (10-2000 characters)

2. **Email Notifications:**
   - Admin notification with full contact details
   - Auto-reply to user with confirmation and expected response time
   - HTML-formatted emails matching XSM Market branding

3. **Response Time Logic:**
   - General inquiries: Within 24 hours
   - Technical support: Within 4-8 hours
   - Transaction issues: Within 2 hours
   - Account issues: Within 4-8 hours

4. **Error Handling:**
   - Graceful handling of email service failures
   - Detailed error logging
   - User-friendly error messages

5. **Email Service Integration:**
   - Uses existing EmailService.php
   - Made sendEmail method public for reusability
   - Supports PHPMailer, SMTP, and fallback to PHP mail()

## Files Created/Modified

### New Files:
- `php-backend/controllers/ContactController.php` - Main contact controller
- `test-contact-api.js` - Test script for contact API

### Modified Files:
- `php-backend/index.php` - Added contact route handling
- `php-backend/utils/EmailService.php` - Made sendEmail method public

## Frontend Integration
The Contact API is fully compatible with the existing frontend Contact.tsx component:
- Uses `/api/contact/submit` endpoint
- Returns `success` field for proper error handling
- Matches expected response format

## Testing
Use the test script to verify functionality:
```bash
node test-contact-api.js
```

## Email Configuration
Ensure these environment variables are set:
- `GMAIL_USER` - Gmail account for sending emails
- `GMAIL_APP_PASSWORD` - Gmail app password
- `SMTP_HOST` (optional) - SMTP server
- `SMTP_PORT` (optional) - SMTP port

The contact form will send:
1. Admin notification to the configured admin email
2. Auto-reply confirmation to the user's email
