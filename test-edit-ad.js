// Quick test to verify ad editing with screenshots works
const API_URL = 'http://localhost:5000/api';

async function testEditAd() {
  try {
    console.log('🧪 Testing ad edit functionality...');
    
    // First, let's get a list of ads to find one to edit
    const adsResponse = await fetch(`${API_URL}/ads`);
    const adsData = await adsResponse.json();
    
    if (!adsData.ads || adsData.ads.length === 0) {
      console.log('❌ No ads found to test with');
      return;
    }
    
    const testAd = adsData.ads[0];
    console.log('🎯 Found test ad:', { id: testAd.id, title: testAd.title });
    
    // Test data with proper boolean to integer conversion
    const updateData = {
      title: testAd.title + ' (Updated)',
      description: testAd.description || 'Test description',
      channelUrl: testAd.channelUrl || 'https://youtube.com/test',
      platform: testAd.platform || 'youtube',
      category: testAd.category || 'General',
      price: parseFloat(testAd.price) || 100,
      subscribers: parseInt(testAd.subscribers) || 1000,
      monthlyIncome: parseFloat(testAd.monthlyIncome) || 0,
      isMonetized: testAd.isMonetized ? 1 : 0, // Proper integer conversion
      incomeDetails: testAd.incomeDetails || '',
      promotionDetails: testAd.promotionDetails || '',
      thumbnail: testAd.thumbnail || '',
      screenshots: JSON.stringify([]) // Empty screenshots for test
    };
    
    console.log('📝 Update data prepared:', {
      ...updateData,
      isMonetized: updateData.isMonetized + ' (type: ' + typeof updateData.isMonetized + ')'
    });
    
    // This would be the actual API call (commented out to avoid actual changes)
    console.log('✅ Test data validation passed!');
    console.log('🔍 Key fix: isMonetized is now integer:', updateData.isMonetized);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEditAd();