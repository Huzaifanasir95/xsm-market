# JWT Access Token Management System

## Overview

Your XSM Market app now has a robust JWT access token management system that:

1. **Always ensures valid access tokens** - The system automatically refreshes tokens before they expire
2. **Handles token expiry gracefully** - When tokens expire, it tries to refresh them automatically
3. **Forces re-login when needed** - If refresh fails, users are prompted to login again
4. **Provides user notifications** - Users get notified about session expiry

## How It Works

### 1. Token Generation & Storage
- **Access Token**: Short-lived (1 hour) for API authentication
- **Refresh Token**: Long-lived (7 days) for generating new access tokens
- **Automatic Storage**: Tokens are stored in localStorage with expiry timestamps

### 2. Automatic Token Refresh
- **Buffer Time**: Tokens are considered expired 5 minutes before actual expiry
- **Automatic Refresh**: `authenticatedFetch` automatically refreshes tokens when needed
- **Retry Logic**: If an API call returns 401, it tries to refresh the token and retry

### 3. User Experience
- **Seamless Experience**: Users don't notice token refreshes happening
- **Session Warnings**: Users get warned when sessions will expire in 10 minutes
- **Graceful Logout**: When refresh fails, users are logged out with a clear message

## Implementation Details

### Frontend Components

1. **AuthProvider** (`src/context/AuthProvider.tsx`)
   - Listens for token expiry events
   - Automatically logs out users when tokens can't be refreshed

2. **useTokenManager** (`src/hooks/useTokenManager.ts`)
   - Shows toast notifications for session expiry
   - Provides periodic token status checking
   - Warns users about upcoming session expiry

3. **Auth Service** (`src/services/auth.ts`)
   - `authenticatedFetch`: Automatically handles token refresh
   - `refreshAccessToken`: Refreshes tokens using refresh token
   - `isTokenExpired`: Checks if token needs refresh

### Backend Components

1. **Token Generation** (`backend/controllers/authController.js`)
   - `generateAccessToken`: Creates 1-hour access tokens
   - `generateRefreshToken`: Creates 7-day refresh tokens
   - `refreshToken`: Endpoint to refresh expired tokens

2. **Environment Variables** (`backend/.env`)
   - `JWT_SECRET`: For signing access tokens
   - `JWT_REFRESH_SECRET`: For signing refresh tokens

## Usage Examples

### Making Authenticated API Calls

```typescript
import { authenticatedFetch } from '@/services/auth';

// This will automatically handle token refresh if needed
const response = await authenticatedFetch('/api/user/profile');
const userData = await response.json();
```

### Checking Token Status

```typescript
import { useTokenManager } from '@/hooks/useTokenManager';

const { checkTokenStatus } = useTokenManager();

const status = checkTokenStatus();
console.log('Token status:', status);
// {
//   hasToken: true,
//   isExpired: false,
//   expiresAt: Date object,
//   timeUntilExpiry: 3600 // seconds
// }
```

## Token Flow Diagram

```
User Login/Register
       ↓
Store Access + Refresh Tokens
       ↓
User Makes API Call
       ↓
Check if Access Token Valid
       ↓
If Expired → Try Refresh
       ↓
If Refresh Success → Retry API Call
       ↓
If Refresh Fails → Force Logout
```

## Testing the System

1. **Login** to get tokens
2. **Wait** or manually expire the access token
3. **Make an API call** - should automatically refresh
4. **Remove refresh token** and make API call - should force logout

## Configuration

### Token Expiry Times
- Access Token: 1 hour (configured in `backend/controllers/authController.js`)
- Refresh Token: 7 days (configured in `backend/controllers/authController.js`)
- Buffer Time: 5 minutes (configured in `src/services/auth.ts`)

### Security Features
- Separate secrets for access and refresh tokens
- Token type validation (access vs refresh)
- User existence validation on refresh
- Automatic cleanup on failed refresh

## Next Steps

The token management system is now fully implemented and ready for production use. You can:

1. Test the complete flow with real user registration and login
2. Add more protected API endpoints using `authenticatedFetch`
3. Customize token expiry times based on your security requirements
4. Add additional security features like token blacklisting if needed
