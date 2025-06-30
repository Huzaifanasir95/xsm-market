# XSM Market - Digital Channel Marketplace

XSM Market is a full-stack marketplace application that facilitates the buying and selling of digital channels with a focus on security, trust, and user experience.

## 🚀 Core Features

### 🔐 Authentication & Security
- **Multi-Provider Authentication**
  - Email/Password registration with OTP verification
  - Google OAuth integration with automatic account setup
  - Secure JWT-based session management with refresh tokens

- **Account Security**
  - Two-step email verification process
  - Password strength requirements (min 6 characters)
  - Secure password reset flow
  - Protected API routes with JWT middleware

### 👤 User Management
- **Profile Management**
  - Customizable username and full name
  - Profile picture upload/URL support
  - Email verification status
  - Auth provider tracking (Google/Email)

- **KYC Verification**
  - Government ID verification (National ID/Driver's License/Passport)
  - Document upload and verification system
  - Verification status tracking (Unverified/Pending/Verified)
  - Enhanced trust features for verified users

### 💼 Marketplace Features
- **Channel Listings**
  - Modern, sleek card-based UI
  - Quick-view stats (Category, Subscribers)
  - Interactive card design with full clickability
  - Streamlined purchase process

- **Transaction System**
  - Secure payment processing
  - Admin fee calculation (7.5%)
  - Escrow-style protection
  - Money-back guarantee (7 days)

### 🛡️ Security Features
- **Data Protection**
  - SQL injection protection via Sequelize ORM
  - Input sanitization
  - Secure password hashing (bcrypt)
  - CORS protection

- **Transaction Security**
  - Admin-facilitated channel transfers
  - Escrow payment protection
  - Verified seller system
  - Secure payment processing

### 💫 UI/UX Features
- **Modern Interface**
  - Responsive design
  - Dark theme with yellow accents
  - Clean and intuitive navigation
  - Loading states and error handling

- **Interactive Elements**
  - Real-time form validation
  - Toast notifications
  - Loading spinners
  - Error messages

## 🔧 Technical Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Custom UI components

### Backend
- Node.js with Express
- MariaDB/MySQL database
- Sequelize ORM
- JWT authentication

### Security
- bcrypt password hashing
- JWT token authentication
- OTP for email verification
- Google OAuth integration

## 🔍 Advanced Features

### User Verification Flow
1. Email verification via OTP
2. KYC document submission
3. Admin review process
4. Verification badge allocation

### Payment Processing
1. Secure card details collection
2. Admin fee calculation
3. Escrow-based holding
4. Success/failure handling

### Profile Management
1. Real-time username availability check
2. Profile picture management
3. Password change with validation
4. Email verification status

### Channel Management
1. Listing creation and management
2. Statistics tracking
3. Purchase process handling
4. Transfer verification

## 📈 Trust & Safety

### Buyer Protection
- 7-day money-back guarantee
- Escrow payment protection
- Verified seller badges
- Secure payment processing

### Seller Protection
- KYC verification system
- Admin-facilitated transfers
- Clear documentation
- Support system access

### Platform Security
- Rate limiting
- Input validation
- SQL injection protection
- XSS prevention

## 🌟 User Experience

### Streamlined Processes
- One-click Google sign-in
- Email verification via OTP
- Interactive form validation
- Real-time updates

### Clear Communication
- Status notifications
- Error messaging
- Process progress indicators
- Email notifications

## 🔐 Privacy & Compliance

### Data Protection
- Secure password storage
- Limited data collection
- Clear privacy policy
- User data control

### Compliance
- KYC regulations
- Payment processing standards
- Data protection requirements
- Platform guidelines

---

This platform combines robust security features with a modern, user-friendly interface to create a trusted marketplace for digital channel trading.
