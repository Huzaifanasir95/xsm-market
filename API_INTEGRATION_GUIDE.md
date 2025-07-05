# Social Media API Integration Guide

## Overview
This guide explains how to set up real APIs for social media profile extraction instead of web scraping. The system includes both real API integration and mock data fallbacks.

## API Setup Instructions

### 1. YouTube Data API v3 (Google)

**Steps to get API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add the API key to your environment variables

**Environment Variable:**
```bash
YOUTUBE_API_KEY=your_youtube_api_key_here
```

**Features:**
- ✅ Channel name, subscriber count, profile picture
- ✅ Reliable and official
- ✅ 10,000 requests/day (free tier)

### 2. Twitter API v2

**Steps to get Bearer Token:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for developer account
3. Create a new app
4. Get Bearer Token from app settings

**Environment Variable:**
```bash
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
```

**Features:**
- ✅ Display name, follower count, profile picture
- ✅ Official API
- ✅ 500,000 requests/month (free tier)

### 3. Facebook Graph API

**Steps to get Access Token:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Generate access token

**Environment Variable:**
```bash
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
```

**Features:**
- ✅ Page name, fan count, profile picture
- ⚠️ Limited to public pages
- ✅ Official API

### 4. Instagram Basic Display API

**Steps to setup:**
1. Use Facebook Developers (Instagram is owned by Meta)
2. Create app and add Instagram Basic Display
3. Get access token

**Environment Variable:**
```bash
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
```

**Features:**
- ⚠️ Requires user authorization
- ✅ Official API
- 📝 Limited to authorized accounts

### 5. Third-Party API Services (Recommended)

#### RapidAPI Hub
Multiple social media APIs available:
- Instagram API
- TikTok API  
- YouTube API
- Twitter API

**Setup:**
1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Subscribe to social media APIs
3. Get API key

**Environment Variable:**
```bash
RAPIDAPI_KEY=your_rapidapi_key_here
```

#### Social Blade API
Analytics for all major platforms:
- Subscriber counts
- Growth statistics
- Historical data

#### Other Services
- **Apify**: Web scraping as a service
- **ScrapingBee**: Anti-detection scraping
- **Bright Data**: Enterprise scraping solutions

## Current Implementation

### API Priority System
1. **Primary**: Official APIs (YouTube, Twitter, Facebook)
2. **Secondary**: Third-party APIs (RapidAPI, Social Blade)
3. **Fallback**: Mock data with realistic numbers

### Mock Data Features
- ✅ Realistic follower counts for popular accounts
- ✅ Generated profile pictures
- ✅ Platform-appropriate usernames
- ✅ Instant response (no API delays)

## Environment Variables Setup

Create a `.env` file in your backend directory:

```bash
# Official APIs
YOUTUBE_API_KEY=your_youtube_api_key
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token

# Third-party APIs
RAPIDAPI_KEY=your_rapidapi_key
SOCIALBLADE_API_KEY=your_socialblade_key

# Other services
APIFY_TOKEN=your_apify_token
SCRAPINGBEE_API_KEY=your_scrapingbee_key
```

## API Usage Examples

### YouTube Data API v3
```javascript
// Get channel statistics
const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
  params: {
    part: 'snippet,statistics',
    id: channelId,
    key: process.env.YOUTUBE_API_KEY
  }
});
```

### Twitter API v2
```javascript
// Get user by username
const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
  headers: {
    'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
  },
  params: {
    'user.fields': 'name,description,profile_image_url,public_metrics'
  }
});
```

### Facebook Graph API
```javascript
// Get page information
const response = await axios.get(`https://graph.facebook.com/v18.0/${pageName}`, {
  params: {
    fields: 'name,fan_count,picture',
    access_token: process.env.FACEBOOK_ACCESS_TOKEN
  }
});
```

## Rate Limiting & Best Practices

### API Limits
- **YouTube**: 10,000 requests/day
- **Twitter**: 500,000 requests/month  
- **Facebook**: 200 requests/hour
- **RapidAPI**: Varies by plan

### Implementation Tips
1. **Cache Results**: Store API responses for 24 hours
2. **Rate Limiting**: Implement request queuing
3. **Error Handling**: Always have fallback options
4. **Cost Management**: Monitor API usage
5. **User Experience**: Show loading states

## Testing the APIs

### Test with Popular Accounts
```bash
# Test various platforms
curl -X POST http://localhost:5000/api/social-media/extract-profile \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA"}'

curl -X POST http://localhost:5000/api/social-media/extract-profile \
  -H "Content-Type: application/json" \
  -d '{"url": "https://instagram.com/cristiano"}'
```

## Cost Analysis

### Free Tiers
- **YouTube API**: Free (with limits)
- **Twitter API**: Free basic tier
- **Facebook API**: Free (with limits)

### Paid Options
- **RapidAPI**: $10-50/month per API
- **Social Blade**: $3-20/month
- **Enterprise APIs**: $100-1000/month

## Deployment Considerations

### Production Setup
1. **API Keys**: Use secure environment variables
2. **Caching**: Implement Redis for API response caching
3. **Monitoring**: Track API usage and costs
4. **Fallbacks**: Ensure mock data always works
5. **Security**: Validate and sanitize all inputs

### Scaling Tips
- Use API response caching (24 hour TTL)
- Implement request queuing for rate limits
- Consider API aggregation services
- Monitor costs and usage patterns

This API-based approach is much more reliable than web scraping and provides accurate, real-time data while maintaining good user experience through fallback mechanisms.
