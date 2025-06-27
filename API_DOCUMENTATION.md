# XSM Market Backend API - User Management & Authentication

## Overview
The backend now includes comprehensive user management with unique username generation for Google sign-up and full profile management capabilities.

## New Features Implemented

### 1. Unique Username Generation for Google Sign-up
- **Automatic username generation** when users sign up with Google
- **Fallback system**: If full name isn't available, uses email prefix
- **Uniqueness guarantee**: Adds random numbers if username already exists
- **Clean usernames**: Removes special characters and limits length

### 2. Complete User Profile Management
- Update username with availability checking
- Update profile picture
- Change password (for email users)
- Full profile updates

## API Endpoints

### Authentication Endpoints (`/api/auth`)

#### Public Username Check
```
GET /api/auth/check-username?username=<username>
```
**Purpose**: Check if username is available during registration
**Response**:
```json
{
  "available": true,
  "message": "Username is available"
}
```

#### Google Sign-in (Enhanced)
```
POST /api/auth/google-signin
```
**Body**:
```json
{
  "token": "google_id_token"
}
```
**Features**:
- Automatically generates unique username from Google profile
- Falls back to email prefix if name unavailable
- Ensures username uniqueness with random numbers if needed
- Sets up complete user profile

### User Management Endpoints (`/api/user`) - All Protected

#### Get Profile
```
GET /api/user/profile
Authorization: Bearer <token>
```

#### Update Username
```
PUT /api/user/username
Authorization: Bearer <token>
```
**Body**:
```json
{
  "username": "new_username"
}
```

#### Update Profile Picture
```
PUT /api/user/profile-picture
Authorization: Bearer <token>
```
**Body**:
```json
{
  "profilePicture": "https://example.com/image.jpg"
}
```

#### Update Full Profile
```
PUT /api/user/profile
Authorization: Bearer <token>
```
**Body**:
```json
{
  "username": "new_username",
  "profilePicture": "https://example.com/image.jpg"
}
```

#### Check Username Availability (Protected)
```
GET /api/user/check-username?username=<username>
Authorization: Bearer <token>
```

#### Change Password
```
PUT /api/user/password
Authorization: Bearer <token>
```
**Body**:
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

## Username Generation Logic

### For Google Sign-up:
1. **Primary**: Use Google display name
2. **Fallback**: Use email prefix (before @)
3. **Cleanup**: Remove special characters, limit to 20 chars
4. **Uniqueness**: Add random numbers (1-9999) if taken
5. **Final fallback**: Use timestamp if still not unique

### Username Validation Rules:
- Length: 3-50 characters
- Allowed: Letters, numbers, underscores only
- Must be unique across all users

## Error Handling

### Common Error Responses:
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Status Codes:
- `200`: Success
- `400`: Bad request / Validation error
- `401`: Unauthorized
- `404`: Not found
- `500`: Server error

## Frontend Integration

### For Registration Form:
```javascript
// Check username availability in real-time
const checkUsername = async (username) => {
  const response = await fetch(`/api/auth/check-username?username=${username}`);
  return await response.json();
};
```

### For Profile Updates:
```javascript
// Update username
const updateUsername = async (newUsername, token) => {
  const response = await fetch('/api/user/username', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ username: newUsername })
  });
  return await response.json();
};

// Update full profile
const updateProfile = async (profileData, token) => {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  return await response.json();
};
```

### For Google Sign-in:
```javascript
const handleGoogleSignIn = async (googleToken) => {
  const response = await fetch('/api/auth/google-signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: googleToken })
  });
  const data = await response.json();
  // User will have unique username automatically generated
  console.log('User:', data.user);
};
```

## Database Changes
- Enhanced username uniqueness handling
- Improved Google OAuth integration
- Better user profile management

## Security Features
- Password validation for profile changes
- Username format validation
- Protected routes for all user operations
- Token-based authentication

All endpoints include proper error handling, validation, and logging for debugging purposes.
