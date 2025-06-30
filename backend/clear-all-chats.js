const { Chat, Message, ChatParticipant } = require('./models');

async function clearAllChats() {
  try {
    console.log('🧹 Clearing all existing chats...');

    // Delete all messages first
    const deletedMessages = await Message.destroy({
      where: {}
    });
    console.log(`✅ Deleted ${deletedMessages} messages`);

    // Delete all chat participants
    const deletedParticipants = await ChatParticipant.destroy({
      where: {}
    });
    console.log(`✅ Deleted ${deletedParticipants} chat participants`);

    // Delete all chats last
    const deletedChats = await Chat.destroy({
      where: {}
    });
    console.log(`✅ Deleted ${deletedChats} chats`);

    console.log('🎉 All chats have been successfully cleared!');
    
  } catch (error) {
    console.error('❌ Error clearing chats:', error);
  }
}

// Run the cleanup
clearAllChats();
