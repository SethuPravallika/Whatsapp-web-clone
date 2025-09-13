const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  _id: String,
  payload_type: String,
  metaData: Object,
  createdAt: Date,
  startedAt: Date,
  completedAt: Date,
  executed: Boolean,
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'unknown'],
    default: 'unknown'
  },
  message_id: String,
  meta_msg_id: String,
  from: String,
  to: String,
  timestamp: Date,
  body: String,
  type: String,
  conversation_id: String,
  user_name: String,
  user_wa_id: String
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);