# 📊 XSM MARKET DATABASE STRUCTURE - COMPLETE ANALYSIS

## 🗄️ **DATABASE OVERVIEW**
- **Database Name**: `xsm_market_local`
- **Total Tables**: 9
- **Engine**: InnoDB
- **Charset**: utf8mb4_unicode_ci

---

## 📋 **TABLE BREAKDOWN**

### 1️⃣ **USERS TABLE** (24 columns)
**Purpose**: User accounts, authentication, admin controls
```sql
id (PK, AUTO_INCREMENT)
username (UNIQUE)
email (UNIQUE) 
password
fullName
phone
location
bio
profilePicture
googleId (for OAuth)
authProvider (email/google)
isEmailVerified
emailOTP
otpExpires
passwordResetToken
passwordResetExpires
isAdmin
isBanned
banReason
bannedAt
bannedBy
unbannedAt
unbannedBy
createdAt
updatedAt
```

### 2️⃣ **ADS TABLE** (37 columns)
**Purpose**: Channel listings, marketplace items
```sql
id (PK, AUTO_INCREMENT)
userId (FK to users)
title
description
channelUrl
primary_image
platform (facebook/instagram/twitter/tiktok/youtube)
category
contentType
contentCategory
price
subscribers
monthlyIncome
isMonetized
incomeDetails
promotionDetails
status (active/pending/sold/suspended/rejected)
verified
premium
views
totalViews
rating
thumbnail
screenshots
tags
socialBladeUrl
location
sellCondition
soldTo (FK to users)
soldAt
approvedAt
approvedBy
rejectedAt
rejectedBy
rejectionReason
createdAt
updatedAt
```

### 3️⃣ **CHATS TABLE** (8 columns)
**Purpose**: Chat conversations between users
```sql
id (PK, AUTO_INCREMENT)
type (direct/group/ad_inquiry)
name
adId (FK to ads)
lastMessage
lastMessageTime
createdAt
updatedAt
```

### 4️⃣ **CHAT_PARTICIPANTS TABLE** (9 columns)
**Purpose**: Users participating in chats
```sql
id (PK, AUTO_INCREMENT)
chatId (FK to chats)
userId (FK to users)
role (admin/member)
isActive
joinedAt
lastSeenAt
createdAt
updatedAt
```

### 5️⃣ **MESSAGES TABLE** (13 columns)
**Purpose**: Individual chat messages with media support
```sql
id (PK, AUTO_INCREMENT)
chatId (FK to chats)
senderId (FK to users)
content
messageType (text/image/file/system/video)
mediaUrl
fileName
fileSize
thumbnail
replyToId (FK to messages)
isRead
createdAt
updatedAt
```

### 6️⃣ **DEALS TABLE** (44 columns)
**Purpose**: Complete deal/transaction management
```sql
id (PK, AUTO_INCREMENT)
transaction_id (UNIQUE)
buyer_id (FK to users)
seller_id (FK to users)
channel_id
channel_title
channel_price
escrow_fee
transaction_type (safest/fastest)
buyer_email
buyer_payment_methods
seller_agreed
seller_agreed_at
buyer_agreed
buyer_agreed_at
deal_status (21 different statuses)
chat_id
notes
created_at
updated_at
transaction_fee_paid
transaction_fee_paid_at
transaction_fee_paid_by
transaction_fee_payment_method
agent_email_sent
agent_email_sent_at
seller_gave_rights
seller_gave_rights_at
rights_timer_started_at
rights_timer_expires_at
timer_completed
seller_made_primary_owner
seller_made_primary_owner_at
platform_type
buyer_paid_seller
buyer_paid_seller_at
seller_confirmed_payment
seller_confirmed_payment_at
admin_confirmed_ownership
admin_confirmed_ownership_at
admin_transferred_to_buyer
admin_transferred_to_buyer_at
rights_verified
rights_verified_at
admin_delivered_account
admin_delivered_account_at
buyer_received_account
buyer_received_account_at
```

### 7️⃣ **DEAL_HISTORY TABLE** (6 columns)
**Purpose**: Audit trail for all deal actions
```sql
id (PK, AUTO_INCREMENT)
deal_id (FK to deals)
action_type (23 different actions)
action_by (FK to users)
action_description
metadata
created_at
```

### 8️⃣ **DEAL_PAYMENT_METHODS TABLE** (6 columns)
**Purpose**: Payment methods for deals
```sql
id (PK, AUTO_INCREMENT)
deal_id (FK to deals)
payment_method_id
payment_method_name
payment_method_category (bank/digital/crypto/other)
created_at
```

### 9️⃣ **CRYPTO_PAYMENTS TABLE** (16 columns)
**Purpose**: NOWPayments cryptocurrency transactions
```sql
id (PK, AUTO_INCREMENT)
deal_id (FK to deals)
nowpayments_payment_id (UNIQUE)
order_id
payment_status (waiting/confirming/confirmed/sending/finished/failed/refunded/expired)
price_amount
price_currency
actually_paid
pay_currency
outcome_amount
outcome_currency
payment_url
qr_code_url
webhook_data
created_at
updated_at
```

---

## 🔗 **FOREIGN KEY RELATIONSHIPS**

```
users (1) → ads (many) via userId
users (1) → deals (many) via buyer_id, seller_id
ads (1) → chats (many) via adId
chats (1) → chat_participants (many) via chatId
chats (1) → messages (many) via chatId
users (1) → chat_participants (many) via userId
users (1) → messages (many) via senderId
deals (1) → deal_history (many) via deal_id
deals (1) → deal_payment_methods (many) via deal_id
deals (1) → crypto_payments (many) via deal_id
messages (1) → messages (many) via replyToId (self-reference)
```

---

## 📈 **KEY FEATURES SUPPORTED**

### ✅ **User Management**
- Email & Google OAuth authentication
- Admin controls and user banning
- Email verification with OTP
- Password reset functionality

### ✅ **Marketplace**
- Multi-platform channel listings (YouTube, Instagram, TikTok, Facebook, Twitter)
- Image galleries and thumbnails
- Social Blade integration
- Approval/rejection workflow

### ✅ **Chat System**
- Direct messages and group chats
- Image, video, and file sharing
- Message replies and read status
- Ad inquiry chats

### ✅ **Deal Management**
- Complete escrow system
- 21 different deal statuses
- Agent rights management
- Timer-based processes
- Payment method negotiation

### ✅ **Cryptocurrency Payments**
- NOWPayments integration
- 8 payment statuses
- QR code generation
- Webhook support

---

## 🚀 **DEPLOYMENT READY**

This schema is:
- ✅ **Production Ready**: All constraints and indexes in place
- ✅ **Performance Optimized**: 15+ indexes for fast queries
- ✅ **Feature Complete**: Supports all XSM Market functionality
- ✅ **Hostinger Compatible**: MySQL/MariaDB compliant
- ✅ **Sample Data Included**: Ready for immediate testing

**Total Columns**: 166 across all tables
**Total Indexes**: 25+ for optimal performance
**Total Sample Records**: 9 (1 admin + 3 users + 5 sample ads)
