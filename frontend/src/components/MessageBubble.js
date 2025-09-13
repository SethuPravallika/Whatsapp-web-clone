import React from 'react';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';

const MessageBubble = ({ message }) => {
  const isOutgoing = message.from !== message.user_wa_id;
  
  const renderStatusIcon = () => {
    if (!isOutgoing) return null;
    
    switch (message.status) {
      case 'sent':
        return <FaCheck className="status-icon sent" />;
      case 'delivered':
        return <FaCheckDouble className="status-icon delivered" />;
      case 'read':
        return <FaCheckDouble className="status-icon read" />;
      default:
        return <FaCheck className="status-icon" />;
    }
  };

  return (
    <div className={`message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}>
      <div className="message-content">
        <p>{message.body || ''}</p>
        <div className="message-meta">
          <span className="message-time">
            {message.timestamp 
              ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''
            }
          </span>
          {isOutgoing && renderStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;