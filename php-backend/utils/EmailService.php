<?php
// Include PHPMailer manually if available
if (file_exists(__DIR__ . '/../vendor/phpmailer/src/PHPMailer.php')) {
    require_once __DIR__ . '/../vendor/phpmailer/src/PHPMailer.php';
    require_once __DIR__ . '/../vendor/phpmailer/src/SMTP.php';
    require_once __DIR__ . '/../vendor/phpmailer/src/Exception.php';
}

// EmailService - Converted from Node.js emailService to maintain identical functionality
class EmailService {
    private $smtpHost;
    private $smtpPort;
    private $smtpUser;
    private $smtpPassword;
    
    public function __construct() {
        // Load environment from .env file if not loaded
        if (!getenv('GMAIL_USER') && file_exists(__DIR__ . '/../.env')) {
            $envFile = __DIR__ . '/../.env';
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                    list($key, $value) = explode('=', $line, 2);
                    putenv(trim($key) . '=' . trim($value));
                }
            }
        }
        
        $this->smtpHost = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
        $this->smtpPort = getenv('SMTP_PORT') ?: 587;
        $this->smtpUser = getenv('GMAIL_USER') ?: '';
        $this->smtpPassword = getenv('GMAIL_APP_PASSWORD') ?: '';
        
        // Debug log for email configuration
        error_log('Email Service Config - User: ' . $this->smtpUser . ', Host: ' . $this->smtpHost);
    }
    
    // Send OTP email - identical to Node.js sendOTPEmail function
    public function sendOTPEmail($email, $otp, $username) {
        try {
            error_log("Attempting to send OTP email to: $email with OTP: $otp");
            
            $subject = 'XSM Market - Email Verification';
            $htmlBody = $this->getOTPEmailTemplate($otp, $username);
            $textBody = "Hello $username,\n\nYour verification code is: $otp\n\nThis code expires in 10 minutes.\n\nBest regards,\nXSM Market Team";
            
            $result = $this->sendEmail($email, $subject, $htmlBody, $textBody);
            error_log("Email send result: " . ($result ? 'SUCCESS' : 'FAILED'));
            
            return $result;
            
        } catch (Exception $e) {
            error_log('Failed to send OTP email: ' . $e->getMessage());
            return false;
        }
    }
    
    // Send welcome email - identical to Node.js sendWelcomeEmail function
    public function sendWelcomeEmail($email, $username) {
        try {
            $subject = 'Welcome to XSM Market!';
            $htmlBody = $this->getWelcomeEmailTemplate($username);
            $textBody = "Hello $username,\n\nWelcome to XSM Market! Your account has been successfully verified.\n\nYou can now start buying and selling social media accounts.\n\nBest regards,\nXSM Market Team";
            
            return $this->sendEmail($email, $subject, $htmlBody, $textBody);
            
        } catch (Exception $e) {
            error_log('Failed to send welcome email: ' . $e->getMessage());
            return false;
        }
    }
    
    // Send password reset email - identical to Node.js functionality
    public function sendPasswordResetEmail($email, $resetToken) {
        try {
            $resetUrl = ($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173') . '/reset-password?token=' . $resetToken;
            $subject = 'XSM Market - Password Reset';
            $htmlBody = $this->getPasswordResetEmailTemplate($resetUrl);
            $textBody = "You requested a password reset.\n\nClick the link below to reset your password:\n$resetUrl\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nXSM Market Team";
            
            return $this->sendEmail($email, $subject, $htmlBody, $textBody);
            
        } catch (Exception $e) {
            error_log('Failed to send password reset email: ' . $e->getMessage());
            return false;
        }
    }
    
    // Send contact form email
    public function sendContactEmail($contactData) {
        try {
            $adminEmail = $_ENV['ADMIN_EMAIL'] ?? $_ENV['GMAIL_USER'];
            $subject = 'XSM Market - Contact Form: ' . $contactData['subject'];
            
            $htmlBody = $this->getContactEmailTemplate($contactData);
            $textBody = "New contact form submission:\n\nName: {$contactData['name']}\nEmail: {$contactData['email']}\nSubject: {$contactData['subject']}\n\nMessage:\n{$contactData['message']}";
            
            return $this->sendEmail($adminEmail, $subject, $htmlBody, $textBody);
            
        } catch (Exception $e) {
            error_log('Failed to send contact email: ' . $e->getMessage());
            return false;
        }
    }
    
    // Core email sending function - made public for use by other controllers
    public function sendEmail($to, $subject, $htmlBody, $textBody = '') {
        try {
            error_log("Checking email method availability...");
            // Use PHPMailer if available, otherwise try SMTP direct or PHP mail()
            if (class_exists('PHPMailer\PHPMailer\PHPMailer') || class_exists('PHPMailer')) {
                error_log("Using PHPMailer for email sending");
                return $this->sendWithPHPMailer($to, $subject, $htmlBody, $textBody);
            } else if ($this->smtpUser && $this->smtpPassword) {
                error_log("Attempting SMTP direct connection");
                return $this->sendWithSMTP($to, $subject, $htmlBody, $textBody);
            } else {
                error_log("PHPMailer not available and SMTP not configured, using PHP mail()");
                return $this->sendWithPHPMail($to, $subject, $htmlBody);
            }
            
        } catch (Exception $e) {
            error_log('Email sending error: ' . $e->getMessage());
            return false;
        }
    }
    
    // Send with PHPMailer (preferred method)
    private function sendWithPHPMailer($to, $subject, $htmlBody, $textBody) {
        // Support both namespaced and non-namespaced PHPMailer
        if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        } else {
            $mail = new PHPMailer(true);
        }
        
        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host = $this->smtpHost;
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtpUser;
            $mail->Password = $this->smtpPassword;
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $this->smtpPort;
            
            // Recipients
            $mail->setFrom($this->smtpUser, 'XSM Market');
            $mail->addAddress($to);
            
            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            if ($textBody) {
                $mail->AltBody = $textBody;
            }
            
            $mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log('PHPMailer error: ' . $mail->ErrorInfo);
            return false;
        }
    }
    
    // Direct SMTP sending without PHPMailer
    private function sendWithSMTP($to, $subject, $htmlBody, $textBody = '') {
        try {
            error_log("Attempting direct SMTP connection to {$this->smtpHost}:{$this->smtpPort}");
            
            // Create socket connection
            $socket = fsockopen($this->smtpHost, $this->smtpPort, $errno, $errstr, 30);
            if (!$socket) {
                error_log("SMTP Connection failed: $errstr ($errno)");
                return false;
            }
            
            // Read initial response
            $response = fgets($socket, 512);
            error_log("SMTP Initial: " . trim($response));
            
            // EHLO
            fputs($socket, "EHLO localhost\r\n");
            $response = fgets($socket, 512);
            error_log("SMTP EHLO: " . trim($response));
            
            // STARTTLS
            fputs($socket, "STARTTLS\r\n");
            $response = fgets($socket, 512);
            error_log("SMTP STARTTLS: " . trim($response));
            
            // Upgrade to TLS
            if (stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                error_log("TLS encryption enabled");
            } else {
                error_log("TLS encryption failed");
                fclose($socket);
                return false;
            }
            
            // EHLO again after TLS
            fputs($socket, "EHLO localhost\r\n");
            $response = fgets($socket, 512);
            error_log("SMTP EHLO after TLS: " . trim($response));
            
            // AUTH LOGIN
            fputs($socket, "AUTH LOGIN\r\n");
            $response = fgets($socket, 512);
            error_log("SMTP AUTH: " . trim($response));
            
            // Send username
            fputs($socket, base64_encode($this->smtpUser) . "\r\n");
            $response = fgets($socket, 512);
            error_log("SMTP Username: " . trim($response));
            
            // Send password
            fputs($socket, base64_encode($this->smtpPassword) . "\r\n");
            $response = fgets($socket, 512);
            error_log("SMTP Password: " . trim($response));
            
            if (strpos($response, '235') === false) {
                error_log("SMTP Authentication failed");
                fclose($socket);
                return false;
            }
            
            // MAIL FROM
            fputs($socket, "MAIL FROM: <{$this->smtpUser}>\r\n");
            $response = fgets($socket, 512);
            error_log("SMTP MAIL FROM: " . trim($response));
            
            // RCPT TO
            fputs($socket, "RCPT TO: <$to>\r\n");
            $response = fgets($socket, 512);
            error_log("SMTP RCPT TO: " . trim($response));
            
            // DATA
            fputs($socket, "DATA\r\n");
            $response = fgets($socket, 512);
            error_log("SMTP DATA: " . trim($response));
            
            // Email headers and body
            $email_data = "From: XSM Market <{$this->smtpUser}>\r\n";
            $email_data .= "To: $to\r\n";
            $email_data .= "Subject: $subject\r\n";
            $email_data .= "MIME-Version: 1.0\r\n";
            $email_data .= "Content-Type: text/html; charset=UTF-8\r\n";
            $email_data .= "\r\n";
            $email_data .= $htmlBody;
            $email_data .= "\r\n.\r\n";
            
            fputs($socket, $email_data);
            $response = fgets($socket, 512);
            error_log("SMTP Send: " . trim($response));
            
            // QUIT
            fputs($socket, "QUIT\r\n");
            $response = fgets($socket, 512);
            error_log("SMTP QUIT: " . trim($response));
            
            fclose($socket);
            
            if (strpos($response, '250') !== false) {
                error_log("Email sent successfully via SMTP");
                return true;
            } else {
                error_log("Email sending failed");
                return false;
            }
            
        } catch (Exception $e) {
            error_log('SMTP sending error: ' . $e->getMessage());
            return false;
        }
    }
    
    // Fallback to PHP mail()
    private function sendWithPHPMail($to, $subject, $htmlBody) {
        error_log("Attempting to send email via PHP mail() to: $to");
        error_log("From email: {$this->smtpUser}");
        
        if (empty($this->smtpUser)) {
            error_log("ERROR: GMAIL_USER not configured");
            return false;
        }
        
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: XSM Market <{$this->smtpUser}>" . "\r\n";
        $headers .= "Reply-To: {$this->smtpUser}" . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();
        
        $result = mail($to, $subject, $htmlBody, $headers);
        error_log("PHP mail() result: " . ($result ? 'SUCCESS' : 'FAILED'));
        
        if (!$result) {
            error_log("PHP mail() failed. Check server mail configuration.");
        }
        
        return $result;
    }
    
    // Email templates
    private function getOTPEmailTemplate($otp, $username) {
        return "
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Email Verification</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1);'>
        <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #333; margin: 0;'>XSM Market</h1>
            <p style='color: #666; margin: 5px 0 0 0;'>Social Media Marketplace</p>
        </div>
        
        <h2 style='color: #333; margin-bottom: 20px;'>Email Verification</h2>
        
        <p style='color: #555; margin-bottom: 20px;'>Hello <strong>$username</strong>,</p>
        
        <p style='color: #555; margin-bottom: 20px;'>Thank you for registering with XSM Market! To complete your registration, please verify your email address using the verification code below:</p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <div style='background-color: #007bff; color: white; padding: 15px 30px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 3px; display: inline-block;'>
                $otp
            </div>
        </div>
        
        <p style='color: #555; margin-bottom: 20px;'>This verification code expires in <strong>10 minutes</strong>.</p>
        
        <p style='color: #555; margin-bottom: 20px;'>If you didn't request this verification, please ignore this email.</p>
        
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        
        <p style='color: #888; font-size: 14px; margin: 0;'>
            Best regards,<br>
            The XSM Market Team
        </p>
    </div>
</body>
</html>";
    }
    
    private function getWelcomeEmailTemplate($username) {
        return "
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Welcome to XSM Market</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1);'>
        <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #333; margin: 0;'>XSM Market</h1>
            <p style='color: #666; margin: 5px 0 0 0;'>Social Media Marketplace</p>
        </div>
        
        <h2 style='color: #28a745; margin-bottom: 20px;'>Welcome!</h2>
        
        <p style='color: #555; margin-bottom: 20px;'>Hello <strong>$username</strong>,</p>
        
        <p style='color: #555; margin-bottom: 20px;'>Welcome to XSM Market! Your account has been successfully verified and you're now ready to start buying and selling social media accounts.</p>
        
        <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
            <h3 style='color: #333; margin-top: 0;'>What you can do now:</h3>
            <ul style='color: #555; margin: 0; padding-left: 20px;'>
                <li>Browse available social media accounts</li>
                <li>List your own accounts for sale</li>
                <li>Chat with buyers and sellers</li>
                <li>Manage your profile and preferences</li>
            </ul>
        </div>
        
        <p style='color: #555; margin-bottom: 20px;'>If you have any questions or need assistance, feel free to contact our support team.</p>
        
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        
        <p style='color: #888; font-size: 14px; margin: 0;'>
            Best regards,<br>
            The XSM Market Team
        </p>
    </div>
</body>
</html>";
    }
    
    private function getPasswordResetEmailTemplate($resetUrl) {
        return "
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Password Reset</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1);'>
        <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #333; margin: 0;'>XSM Market</h1>
            <p style='color: #666; margin: 5px 0 0 0;'>Social Media Marketplace</p>
        </div>
        
        <h2 style='color: #dc3545; margin-bottom: 20px;'>Password Reset Request</h2>
        
        <p style='color: #555; margin-bottom: 20px;'>You requested a password reset for your XSM Market account.</p>
        
        <p style='color: #555; margin-bottom: 20px;'>Click the button below to reset your password:</p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <a href='$resetUrl' style='background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Reset Password</a>
        </div>
        
        <p style='color: #555; margin-bottom: 20px;'>This link expires in <strong>15 minutes</strong>.</p>
        
        <p style='color: #555; margin-bottom: 20px;'>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        
        <p style='color: #888; font-size: 14px; margin: 0;'>
            Best regards,<br>
            The XSM Market Team
        </p>
    </div>
</body>
</html>";
    }
    
    private function getContactEmailTemplate($contactData) {
        return "
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Contact Form Submission</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1);'>
        <h2 style='color: #333; margin-bottom: 20px;'>New Contact Form Submission</h2>
        
        <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
            <p><strong>Name:</strong> {$contactData['name']}</p>
            <p><strong>Email:</strong> {$contactData['email']}</p>
            <p><strong>Subject:</strong> {$contactData['subject']}</p>
        </div>
        
        <h3 style='color: #333;'>Message:</h3>
        <div style='background-color: #ffffff; border: 1px solid #ddd; padding: 15px; border-radius: 5px;'>
            <p style='margin: 0; white-space: pre-wrap;'>{$contactData['message']}</p>
        </div>
        
        <p style='color: #888; font-size: 14px; margin-top: 30px;'>
            Received at: " . date('Y-m-d H:i:s') . "
        </p>
    </div>
</body>
</html>";
    }
}
