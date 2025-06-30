require('dotenv').config();
const { Chat, Message, ChatParticipant, User, Ad } = require('./models');

async function testMultipleBuyers() {
  try {
    console.log('🧪 Testing multiple buyers contacting the same seller...');

    // Check if we have users and ads
    const users = await User.findAll({ limit: 3 });
    const ads = await Ad.findAll({ limit: 1 });

    if (users.length < 3) {
      console.log('❌ Need at least 3 users in database');
      return;
    }

    if (ads.length < 1) {
      console.log('❌ Need at least 1 ad in database');
      return;
    }

    const seller = users[0]; // User 1 as seller
    const buyer1 = users[1]; // User 2 as first buyer
    const buyer2 = users[2]; // User 3 as second buyer
    const ad = ads[0];

    console.log(`📊 Seller: User ${seller.id} (${seller.username})`);
    console.log(`📊 Buyer 1: User ${buyer1.id} (${buyer1.username})`);
    console.log(`📊 Buyer 2: User ${buyer2.id} (${buyer2.username})`);
    console.log(`📊 Ad: ${ad.id} (${ad.title})`);

    // Simulate first buyer creating a chat
    console.log('\n👤 Buyer 1 creating chat...');
    const chat1 = await Chat.create({
      type: 'ad_inquiry',
      adId: ad.id,
      name: `Chat with ${seller.username}`
    });

    await ChatParticipant.bulkCreate([
      { chatId: chat1.id, userId: seller.id, role: 'admin' },
      { chatId: chat1.id, userId: buyer1.id, role: 'member' }
    ]);

    await Message.create({
      content: `Hi, I'm interested in your item: ${ad.title}`,
      senderId: buyer1.id,
      chatId: chat1.id,
      messageType: 'text'
    });

    console.log(`✅ Chat 1 created: ID ${chat1.id} between User ${buyer1.id} and User ${seller.id}`);

    // Simulate second buyer creating a chat
    console.log('\n👤 Buyer 2 creating chat...');
    const chat2 = await Chat.create({
      type: 'ad_inquiry',
      adId: ad.id,
      name: `Chat with ${seller.username}`
    });

    await ChatParticipant.bulkCreate([
      { chatId: chat2.id, userId: seller.id, role: 'admin' },
      { chatId: chat2.id, userId: buyer2.id, role: 'member' }
    ]);

    await Message.create({
      content: `Hi, I'm interested in your item: ${ad.title}`,
      senderId: buyer2.id,
      chatId: chat2.id,
      messageType: 'text'
    });

    console.log(`✅ Chat 2 created: ID ${chat2.id} between User ${buyer2.id} and User ${seller.id}`);

    // Verify both chats exist
    const allChats = await Chat.findAll({
      where: { adId: ad.id },
      include: [{
        model: ChatParticipant,
        as: 'participants',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }]
      }]
    });

    console.log(`\n📊 Total chats for Ad ${ad.id}: ${allChats.length}`);
    
    allChats.forEach(chat => {
      const participants = chat.participants.map(p => `User ${p.user.id} (${p.user.username})`);
      console.log(`   Chat ${chat.id}: ${participants.join(' & ')}`);
    });

    if (allChats.length === 2) {
      console.log('\n🎉 SUCCESS: Multiple buyers can contact the same seller!');
    } else {
      console.log('\n❌ FAILED: Expected 2 chats, got', allChats.length);
    }

  } catch (error) {
    console.error('❌ Error testing multiple buyers:', error);
  }
}

// Run the test
testMultipleBuyers();
