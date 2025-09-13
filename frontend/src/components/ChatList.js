import React from 'react';

const ChatList = ({ conversations, onSelectChat, selectedChat }) => {
  return (
    <div className="chat-list">
      <div className="chat-list-items">
        {conversations.map(conversation => (
          <div 
            key={conversation._id} 
            className={`chat-item ${selectedChat === conversation._id ? 'selected' : ''}`}
            onClick={() => onSelectChat(conversation._id)}
          >
            <div className="chat-avatar">
              {/* Add null check for user_name */}
              {(conversation.user_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="chat-info">
              <div className="chat-name">{conversation.user_name || 'Unknown User'}</div>
              <div className="chat-last-message">{conversation.last_message || 'No messages'}</div>
            </div>
            <div className="chat-meta">
              <div className="chat-time">
                {conversation.last_timestamp 
                  ? new Date(conversation.last_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''
                }
              </div>
              {conversation.unread_count > 0 && (
                <div className="unread-badge">{conversation.unread_count}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;