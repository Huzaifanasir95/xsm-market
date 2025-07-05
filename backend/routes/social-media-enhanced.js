const express = require('express');
const router = express.Router();
const axios = require('axios');

// Social Blade API integration
const fetchSocialBladeData = async (platform, username) => {
  try {
    const clientId = process.env.SOCIALBLADE_CLIENT_ID;
    const token = process.env.SOCIALBLADE_TOKEN;
    
    if (!clientId || !token) {
      console.log('Social Blade credentials not found in .env file');
      return null;
    }

    console.log(`🔍 Fetching Social Blade data for ${platform}/${username}`);
    
    // Correct Social Blade API endpoint structure
    const apiUrl = `https://matrix.sbapis.com/b/${platform}/statistics`;
    
    console.log(`📡 Making request to: ${apiUrl}?query=${username}&history=default&allow-stale=false`);
    
    const response = await axios.get(apiUrl, {
      params: {
        query: username,
        history: 'default',
        'allow-stale': false
      },
      headers: {
        'clientid': clientId,
        'token': token,
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15 second timeout
    });

    // Check if request was successful
    if (response.data && response.data.status && response.data.status.success && response.data.data) {
      const data = response.data.data;
      
      // Map Social Blade response to our standard format based on platform
      let followers = 0;
      let profilePicture = null;
      let title = data.id?.display_name || data.id?.username || username;
      
      if (platform === 'youtube') {
        followers = data.statistics?.total?.subscribers || 0;
        profilePicture = data.general?.branding?.avatar;
      } else if (platform === 'instagram') {
        followers = data.statistics?.total?.followers || 0;
        profilePicture = data.general?.branding?.avatar;
      } else if (platform === 'tiktok') {
        followers = data.statistics?.total?.followers || 0;
        profilePicture = data.general?.branding?.avatar;
      } else if (platform === 'twitter') {
        followers = data.statistics?.total?.followers || 0;
        profilePicture = data.general?.branding?.avatar;
      } else if (platform === 'facebook') {
        followers = data.statistics?.total?.likes || 0; // Facebook uses 'likes' instead of followers
        profilePicture = data.general?.branding?.avatar;
      }
      
      return {
        title: title,
        followers: followers,
        profilePicture: profilePicture,
        platform: platform,
        verified: data.misc?.sb_verified || false,
        source: 'socialblade',
        grade: data.misc?.grade || null,
        rank: data.ranks || null
      };
    }
    
    // Log the full response for debugging if it failed
    if (response.data && response.data.status && !response.data.status.success) {
      console.log(`Social Blade API returned error:`, response.data.status.error);
    }
    
    return null;
  } catch (error) {
    console.log(`Social Blade API error for ${platform}/${username}:`, error.message);
    if (error.response) {
      console.log(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    return null;
  }
};

// Helper function to extract platform from URL
const detectPlatform = (url) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('instagram.com')) {
    return 'instagram';
  } else if (url.includes('tiktok.com')) {
    return 'tiktok';
  } else if (url.includes('twitter.com') || url.includes('x.com')) {
    return 'twitter';
  } else if (url.includes('facebook.com')) {
    return 'facebook';
  }
  return null;
};

// Helper function to extract Instagram username from URL
const extractUsernameFromUrl = (url, platform) => {
  let username = '';
  
  try {
    switch (platform) {
      case 'instagram':
        // Extract from various Instagram URL formats
        const igMatch = url.match(/instagram\.com\/([^\/\?]+)/);
        username = igMatch ? igMatch[1] : '';
        break;
      case 'youtube':
        // Extract channel ID or username
        const ytMatch = url.match(/youtube\.com\/(?:channel\/|c\/|user\/|@)([^\/\?]+)/) || 
                       url.match(/youtu\.be\/([^\/\?]+)/);
        username = ytMatch ? ytMatch[1] : '';
        // Remove @ symbol if present (Social Blade doesn't expect it)
        username = username.replace(/^@/, '');
        break;
      case 'tiktok':
        const ttMatch = url.match(/tiktok\.com\/@([^\/\?]+)/);
        username = ttMatch ? ttMatch[1] : '';
        break;
      case 'twitter':
        const twMatch = url.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/);
        username = twMatch ? twMatch[1] : '';
        break;
      case 'facebook':
        const fbMatch = url.match(/facebook\.com\/([^\/\?]+)/);
        username = fbMatch ? fbMatch[1] : '';
        break;
    }
  } catch (error) {
    console.log('Error extracting username:', error.message);
  }
  
  return username;
};

// Enhanced Instagram data extraction using Social Blade API
const extractInstagramData = async (url) => {
  try {
    const username = extractUsernameFromUrl(url, 'instagram');
    if (!username) {
      throw new Error('Could not extract username from Instagram URL');
    }

    // Try Social Blade API first
    const socialBladeData = await fetchSocialBladeData('instagram', username);
    if (socialBladeData) {
      return socialBladeData;
    }
    
    // Fallback to mock data if Social Blade fails
    console.log('Social Blade API failed, using mock data for Instagram');
    return generateMockInstagramData(username);
  } catch (error) {
    console.error('Error extracting Instagram data:', error.message);
    // Fallback to mock data on any error
    return generateMockInstagramData(username);
  }
};

// Enhanced YouTube data extraction using Social Blade API and YouTube Data API v3
const extractYouTubeData = async (url) => {
  try {
    const channelId = extractUsernameFromUrl(url, 'youtube');
    if (!channelId) {
      throw new Error('Could not extract channel ID from YouTube URL');
    }

    console.log(`🔍 Extracted YouTube username/handle: "${channelId}" from URL: ${url}`);

    // Try Social Blade API first
    const socialBladeData = await fetchSocialBladeData('youtube', channelId);
    if (socialBladeData) {
      return socialBladeData;
    }

    // Fallback to YouTube Data API v3 (requires API key)
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (apiKey) {
      try {
        // Get channel details
        const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
          params: {
            part: 'snippet,statistics',
            id: channelId,
            key: apiKey
          }
        });

        if (response.data.items && response.data.items.length > 0) {
          const channel = response.data.items[0];
          return {
            title: channel.snippet.title,
            subscribers: parseInt(channel.statistics.subscriberCount) || 0,
            profilePicture: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url,
            platform: 'youtube'
          };
        }
      } catch (apiError) {
        console.log('YouTube API error, falling back to mock data:', apiError.message);
      }
    }
    
    // Final fallback to mock data
    console.log('All YouTube APIs failed, using mock data');
    return generateMockYouTubeData(channelId);
  } catch (error) {
    console.error('Error extracting YouTube data:', error.message);
    return generateMockYouTubeData(channelId);
  }
};

// Enhanced TikTok data extraction using Social Blade API
const extractTikTokData = async (url) => {
  try {
    const username = extractUsernameFromUrl(url, 'tiktok');
    if (!username) {
      throw new Error('Could not extract username from TikTok URL');
    }

    // Try Social Blade API first
    const socialBladeData = await fetchSocialBladeData('tiktok', username);
    if (socialBladeData) {
      return socialBladeData;
    }
    
    // Fallback to mock data
    console.log('Social Blade API failed, using mock data for TikTok');
    return generateMockTikTokData(username);
  } catch (error) {
    console.error('Error extracting TikTok data:', error.message);
    return generateMockTikTokData(username);
  }
};

// Enhanced Twitter/X data extraction using Social Blade API and Twitter API v2
const extractTwitterData = async (url) => {
  try {
    const username = extractUsernameFromUrl(url, 'twitter');
    if (!username) {
      throw new Error('Could not extract username from Twitter URL');
    }

    // Try Social Blade API first
    const socialBladeData = await fetchSocialBladeData('twitter', username);
    if (socialBladeData) {
      return socialBladeData;
    }

    // Fallback to Twitter API v2 (requires Bearer token)
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    if (bearerToken) {
      try {
        // Get user by username
        const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
          headers: {
            'Authorization': `Bearer ${bearerToken}`
          },
          params: {
            'user.fields': 'name,description,profile_image_url,public_metrics'
          }
        });

        if (response.data.data) {
          const user = response.data.data;
          return {
            title: user.name,
            followers: user.public_metrics?.followers_count || 0,
            profilePicture: user.profile_image_url,
            platform: 'twitter'
          };
        }
      } catch (apiError) {
        console.log('Twitter API error, falling back to mock data:', apiError.message);
      }
    }
    
    // Final fallback to mock data
    console.log('All Twitter APIs failed, using mock data');
    return generateMockTwitterData(username);
  } catch (error) {
    console.error('Error extracting Twitter data:', error.message);
    return generateMockTwitterData(username);
  }
};

// Enhanced Facebook data extraction using Social Blade API and Facebook Graph API
const extractFacebookData = async (url) => {
  try {
    const pageName = extractUsernameFromUrl(url, 'facebook');
    if (!pageName) {
      throw new Error('Could not extract page name from Facebook URL');
    }

    // Try Social Blade API first
    const socialBladeData = await fetchSocialBladeData('facebook', pageName);
    if (socialBladeData) {
      return socialBladeData;
    }

    // Fallback to Facebook Graph API (requires access token)
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    
    if (accessToken) {
      try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${pageName}`, {
          params: {
            fields: 'name,fan_count,picture',
            access_token: accessToken
          }
        });

        return {
          title: response.data.name,
          followers: response.data.fan_count || 0,
          profilePicture: response.data.picture?.data?.url,
          platform: 'facebook'
        };
      } catch (apiError) {
        console.log('Facebook API error, falling back to mock data:', apiError.message);
      }
    }
    
    // Final fallback to mock data
    console.log('All Facebook APIs failed, using mock data');
    return generateMockFacebookData(pageName);
  } catch (error) {
    console.error('Error extracting Facebook data:', error.message);
    return generateMockFacebookData(pageName);
  }
};


// Mock data generators for demo purposes
const generateMockInstagramData = (username) => {
  const mockProfiles = {
    'nike': { title: 'Nike', followers: 302000000, profilePicture: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=NIKE' },
    'cristiano': { title: 'Cristiano Ronaldo', followers: 615000000, profilePicture: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=CR7' },
    'selenagomez': { title: 'Selena Gomez', followers: 428000000, profilePicture: 'https://via.placeholder.com/150/FF69B4/FFFFFF?text=SG' },
    'kyliejenner': { title: 'Kylie Jenner', followers: 398000000, profilePicture: 'https://via.placeholder.com/150/800080/FFFFFF?text=KJ' },
    'leomessi': { title: 'Leo Messi', followers: 496000000, profilePicture: 'https://via.placeholder.com/150/87CEEB/000000?text=LM' }
  };
  
  const profile = mockProfiles[username.toLowerCase()] || {
    title: username.charAt(0).toUpperCase() + username.slice(1),
    followers: Math.floor(Math.random() * 100000) + 10000,
    profilePicture: `https://via.placeholder.com/150/4169E1/FFFFFF?text=${username.charAt(0).toUpperCase()}`
  };
  
  return { ...profile, platform: 'instagram' };
};

const generateMockYouTubeData = (channelId) => {
  const mockChannels = {
    'PewDiePie': { title: 'PewDiePie', subscribers: 111000000, profilePicture: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=PDP' },
    'MrBeast': { title: 'MrBeast', subscribers: 212000000, profilePicture: 'https://via.placeholder.com/150/00FF00/000000?text=MB' },
    'T-Series': { title: 'T-Series', subscribers: 245000000, profilePicture: 'https://via.placeholder.com/150/FF1493/FFFFFF?text=TS' }
  };
  
  const channel = mockChannels[channelId] || {
    title: `${channelId} Channel`,
    subscribers: Math.floor(Math.random() * 500000) + 50000,
    profilePicture: `https://via.placeholder.com/150/FF0000/FFFFFF?text=${channelId.charAt(0).toUpperCase()}`
  };
  
  return { ...channel, platform: 'youtube' };
};

const generateMockTikTokData = (username) => {
  const mockAccounts = {
    'charlidamelio': { title: "Charli D'Amelio", followers: 151700000, profilePicture: 'https://via.placeholder.com/150/FF69B4/FFFFFF?text=CD' },
    'khaby.lame': { title: 'Khabane Lame', followers: 161400000, profilePicture: 'https://via.placeholder.com/150/000000/FFFFFF?text=KL' },
    'bellapoarch': { title: 'Bella Poarch', followers: 93600000, profilePicture: 'https://via.placeholder.com/150/800080/FFFFFF?text=BP' }
  };
  
  const account = mockAccounts[username.toLowerCase()] || {
    title: `@${username}`,
    followers: Math.floor(Math.random() * 1000000) + 100000,
    profilePicture: `https://via.placeholder.com/150/000000/FFFFFF?text=${username.charAt(0).toUpperCase()}`
  };
  
  return { ...account, platform: 'tiktok' };
};

const generateMockTwitterData = (username) => {
  const mockAccounts = {
    'elonmusk': { title: 'Elon Musk', followers: 155000000, profilePicture: 'https://via.placeholder.com/150/1DA1F2/FFFFFF?text=EM' },
    'barackobama': { title: 'Barack Obama', followers: 131400000, profilePicture: 'https://via.placeholder.com/150/1DA1F2/FFFFFF?text=BO' },
    'justinbieber': { title: 'Justin Bieber', followers: 114300000, profilePicture: 'https://via.placeholder.com/150/1DA1F2/FFFFFF?text=JB' }
  };
  
  const account = mockAccounts[username.toLowerCase()] || {
    title: username.charAt(0).toUpperCase() + username.slice(1),
    followers: Math.floor(Math.random() * 500000) + 50000,
    profilePicture: `https://via.placeholder.com/150/1DA1F2/FFFFFF?text=${username.charAt(0).toUpperCase()}`
  };
  
  return { ...account, platform: 'twitter' };
};

const generateMockFacebookData = (pageName) => {
  const mockPages = {
    'facebook': { title: 'Facebook', followers: 214000000, profilePicture: 'https://via.placeholder.com/150/4267B2/FFFFFF?text=FB' },
    'cocacola': { title: 'Coca-Cola', followers: 108000000, profilePicture: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=CC' },
    'nike': { title: 'Nike', followers: 95000000, profilePicture: 'https://via.placeholder.com/150/000000/FFFFFF?text=NK' }
  };
  
  const page = mockPages[pageName.toLowerCase()] || {
    title: pageName.charAt(0).toUpperCase() + pageName.slice(1),
    followers: Math.floor(Math.random() * 1000000) + 100000,
    profilePicture: `https://via.placeholder.com/150/4267B2/FFFFFF?text=${pageName.charAt(0).toUpperCase()}`
  };
  
  return { ...page, platform: 'facebook' };
};

// Route to extract profile data from social media URL
router.post('/extract-profile', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const platform = detectPlatform(url);
    if (!platform) {
      return res.status(400).json({ message: 'Unsupported social media platform' });
    }

    let profileData;

    console.log(`🔍 Extracting data for ${platform}: ${url}`);

    switch (platform) {
      case 'instagram':
        profileData = await extractInstagramData(url);
        break;
      case 'youtube':
        profileData = await extractYouTubeData(url);
        break;
      case 'tiktok':
        profileData = await extractTikTokData(url);
        break;
      case 'twitter':
        profileData = await extractTwitterData(url);
        break;
      case 'facebook':
        profileData = await extractFacebookData(url);
        break;
      default:
        return res.status(400).json({ message: 'Platform not supported yet' });
    }

    console.log(`✅ Extracted data:`, profileData);

    // Add fallback values if extraction failed
    if (!profileData.title) {
      profileData.title = `${platform.charAt(0).toUpperCase() + platform.slice(1)} Profile`;
    }

    res.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Profile extraction error:', error);
    res.status(500).json({ 
      message: 'Failed to extract profile data', 
      error: error.message 
    });
  }
});

// Route to get suggested categories based on platform
router.get('/categories/:platform', (req, res) => {
  const { platform } = req.params;
  
  const platformCategories = {
    youtube: [
      'Gaming', 'Tech', 'Education', 'Entertainment', 'Music', 'Sports',
      'News', 'Comedy', 'How-to & Style', 'Travel', 'Food', 'Science'
    ],
    instagram: [
      'Fashion & Style', 'Lifestyle', 'Food', 'Travel', 'Fitness',
      'Beauty', 'Photography', 'Art', 'Models & Celebs', 'Business'
    ],
    tiktok: [
      'Entertainment', 'Dance', 'Comedy', 'Food', 'DIY', 'Pets',
      'Fashion', 'Education', 'Music', 'YT Shorts & FB Reels'
    ],
    twitter: [
      'News', 'Tech', 'Business', 'Politics', 'Sports', 'Entertainment',
      'Education', 'Crypto & NFT', 'Science', 'Comedy'
    ],
    facebook: [
      'Business', 'News', 'Entertainment', 'Community', 'Education',
      'Local Services', 'Non-profit', 'Sports', 'Politics'
    ]
  };

  const categories = platformCategories[platform] || [];
  res.json({ categories });
});

module.exports = router;
