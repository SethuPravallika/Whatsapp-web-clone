const Message = require('../models/Message');

const processWebhookPayload = async (payload) => {
  try {
    if (payload.payload_type !== 'whatsapp_webhook') {
      console.log('Invalid payload type');
      return;
    }

    const entry = payload.metaData.entry[0];
    const changes = entry.changes[0];
    
    if (changes.field === 'messages') {
      if (changes.value.messages && changes.value.messages[0]) {
        await processMessagePayload(payload, changes.value);
      } else if (changes.value.statuses && changes.value.statuses[0]) {
        await processStatusPayload(payload, changes.value.statuses[0]);
      }
    }
  } catch (error) {
    console.error('Error processing webhook payload:', error);
  }
};

const processMessagePayload = async (payload, value) => {
  const messageData = value.messages[0];
  const contact = value.contacts[0];
  
  const message = {
    _id: payload._id,
    payload_type: payload.payload_type,
    metaData: payload.metaData,
    createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
    startedAt: payload.startedAt ? new Date(payload.startedAt) : new Date(),
    completedAt: payload.completedAt ? new Date(payload.completedAt) : new Date(),
    executed: payload.executed || false,
    status: 'unknown',
    message_id: messageData.id,
    meta_msg_id: messageData.id,
    from: messageData.from,
    to: value.metadata.phone_number_id,
    timestamp: new Date(parseInt(messageData.timestamp) * 1000),
    body: messageData.text?.body || '',
    type: messageData.type,
    user_name: contact?.profile?.name || 'Unknown',
    user_wa_id: contact?.wa_id || messageData.from
  };

  // Check if conversation exists in metadata
  if (value.statuses?.[0]?.conversation?.id) {
    message.conversation_id = value.statuses[0].conversation.id;
  }

  try {
    // Upsert the message
    await Message.findOneAndUpdate(
      { _id: payload._id },
      message,
      { upsert: true, new: true }
    );
    console.log(`Message ${payload._id} processed successfully`);
  } catch (error) {
    console.error('Error saving message:', error);
  }
};

const processStatusPayload = async (payload, status) => {
  try {
    // Update message status based on message_id or meta_msg_id
    await Message.findOneAndUpdate(
      {
        $or: [
          { message_id: status.id },
          { meta_msg_id: status.meta_msg_id || status.id }
        ]
      },
      {
        status: status.status,
        conversation_id: status.conversation?.id,
        'metaData.entry': payload.metaData.entry
      }
    );
    console.log(`Status updated for message ${status.id} to ${status.status}`);
  } catch (error) {
    console.error('Error updating message status:', error);
  }
};

module.exports = { processWebhookPayload };