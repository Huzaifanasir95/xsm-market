# Social Blade API Integration Setup Guide

## Overview
Your XSM Market platform is now configured to automatically extract profile data from social media links using the Social Blade API. This replaces unreliable web scraping with accurate API-based data extraction.

## ✅ What's Already Done

### 1. Backend Implementation
- **Social Blade API Integration**: Complete integration in `/backend/routes/social-media-enhanced.js`
- **Fallback System**: Uses official platform APIs and mock data if Social Blade is unavailable
- **Multi-Platform Support**: Instagram, YouTube, TikTok, Twitter, Facebook
- **Error Handling**: Comprehensive logging and graceful fallbacks

### 2. Environment Configuration
- Environment variables added to `/backend/.env`
- Placeholder credentials ready for your API keys

## 🔧 Required Setup Steps

### Step 1: Get Social Blade API Credentials
1. Visit [Social Blade API](https://socialblade.com/api)
2. Sign up for an API account
3. Get your **Client ID** and **Token**

### Step 2: Add Credentials to Environment File
Edit `/backend/.env` and replace the placeholder values:

```bash
# Replace these with your actual credentials:
SOCIALBLADE_CLIENT_ID=your_actual_client_id_here
SOCIALBLADE_TOKEN=your_actual_token_here
```

### Step 3: Test the Integration
Run the test script to verify everything works:

```bash
# Test Social Blade API connection
node test-social-blade-integration.js

# Start your backend server
cd backend && npm start

# Test the full extraction endpoint
node test-social-blade-integration.js endpoint
```

## 🔄 How It Works

### Data Extraction Flow
1. **User pastes social media link** → Frontend sends to `/api/social-media/extract-profile`
2. **Platform detection** → Automatically identifies Instagram/YouTube/TikTok/Twitter/Facebook
3. **Social Blade API call** → Fetches accurate profile data, follower counts, profile pictures
4. **Fallback system** → Uses official APIs or mock data if Social Blade fails
5. **Standardized response** → Returns consistent data format for frontend

### Extracted Data
- **Profile Name**: Channel/account name
- **Follower Count**: Real-time subscriber/follower numbers
- **Profile Picture**: High-quality profile image URL
- **Platform**: Detected social media platform
- **Verification Status**: If account is verified

## 🎯 Optional Enhancements

### Add Official Platform APIs (Recommended)
For even better reliability, add these optional API keys to `/backend/.env`:

```bash
# YouTube Data API v3 (Google Cloud Console)
YOUTUBE_API_KEY=your_youtube_api_key

# Twitter API v2 (Twitter Developer Portal)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Facebook Graph API (Meta Developer Portal)
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
```

## 🚀 Usage Examples

### Frontend Integration
The frontend already uses the API. When users paste links like:
- `https://www.youtube.com/c/PewDiePie`
- `https://www.instagram.com/cristiano/`
- `https://www.tiktok.com/@charlidamelio`

The system automatically extracts and displays:
- Channel name
- Subscriber/follower count
- Profile picture
- Platform-specific categories

### API Response Format
```json
{
  "success": true,
  "data": {
    "title": "Channel Name",
    "followers": 123456789,
    "profilePicture": "https://...",
    "platform": "youtube",
    "verified": true,
    "source": "socialblade"
  }
}
```

## 🔍 Troubleshooting

### Common Issues
1. **"Social Blade credentials not found"**
   - Add your credentials to `/backend/.env`
   - Restart the backend server

2. **API Authentication Errors**
   - Verify your Client ID and Token are correct
   - Check Social Blade account status and limits

3. **Rate Limiting**
   - Social Blade has API limits
   - The system will fallback to other methods if limits are exceeded

### Debug Mode
Set `NODE_ENV=development` in your environment to see detailed API logs.

## 📊 Benefits

### Before (Web Scraping)
- ❌ Unreliable due to anti-bot measures
- ❌ Breaks when platforms change HTML
- ❌ Often blocked or returns incorrect data
- ❌ No real-time data

### After (API Integration)
- ✅ Reliable API-based extraction
- ✅ Real-time, accurate data
- ✅ Official rate limits and permissions
- ✅ Graceful fallbacks
- ✅ Better user experience

## 🔗 Resources
- [Social Blade API Documentation](https://socialblade.com/api)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)

---

**Next Steps**: Add your Social Blade credentials and test the integration!
