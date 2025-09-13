const express = require('express');
const router = express.Router();
const { processWebhookPayload } = require('../utils/payloadProcessor');
const Message = require('../models/Message');

// Process incoming webhook
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    await processWebhookPayload(payload);
    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Get all conversations
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { type: 'text' },
            { body: { $exists: true, $ne: '' } }
          ]
        }
      },
      {
        $group: {
          _id: '$user_wa_id',
          user_name: { $first: '$user_name' },
          last_message: { $last: '$body' },
          last_timestamp: { $max: '$timestamp' },
          unread_count: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'delivered'] }, { $eq: ['$from', '$user_wa_id'] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { last_timestamp: -1 } }
    ]);
    
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).send('Error fetching conversations');
  }
});

// Get messages for a specific user
router.get('/messages/:wa_id', async (req, res) => {
  try {
    const { wa_id } = req.params;
    const messages = await Message.find({
      user_wa_id: wa_id,
      $or: [
        { type: 'text' },
        { body: { $exists: true, $ne: '' } }
      ]
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Error fetching messages');
  }
});

// Send a new message (simulated)
router.post('/send-message', async (req, res) => {
  try {
    const { to, body } = req.body;
    
    // Create a new message document
    const newMessage = new Message({
      _id: `user-msg-${Date.now()}`,
      payload_type: 'user_generated',
      from: '918329446654', // Business number
      to: to,
      timestamp: new Date(),
      body: body,
      type: 'text',
      status: 'read', // Assuming it's read immediately in our UI
      user_wa_id: to,
      user_name: 'User', // This would normally come from your contacts
      executed: true,
      createdAt: new Date(),
      startedAt: new Date(),
      completedAt: new Date()
    });
    
    await newMessage.save();
    res.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Error sending message');
  }
});

module.exports = router;