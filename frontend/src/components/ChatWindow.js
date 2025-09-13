import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ conversation, messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(conversation._id, newMessage);
      setNewMessage('');
    }
  };

  if (!conversation) {
    return (
      <div className="chat-window empty">
        <div className="empty-chat">
          <h3>Select a chat to start messaging</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="user-avatar">
            {/* Add null check for user_name */}
            {(conversation.user_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h3>{conversation.user_name || 'Unknown User'}</h3>
            <p>{conversation._id}</p>
          </div>
        </div>
      </div>
      
      <div className="messages-container">
        {messages.map(message => (
          <MessageBubble key={message._id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="message-input-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="text"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;