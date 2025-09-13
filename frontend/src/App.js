import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import './App.css';


// Add this at the top of your App.js, right after the imports
console.log('API Base URL:', process.env.REACT_APP_API_BASE);
console.log('Frontend environment variables:', process.env);

const API_BASE = 'https://your-backend-name.onrender.com/api';

// Optional: log to verify
console.log('API Base URL:', API_BASE);


// Add axios interceptor for better error handling
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`Backend server is not running on port 5002. Please start the server.`);
    }
    throw error;
  }
);

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');

  // Check if server is running
  const checkServerStatus = async () => {
    try {
      await axios.get('http://localhost:5002/health');
      setServerStatus('running');
      return true;
    } catch (error) {
      setServerStatus('down');
      setError('Backend server is not running on port 5002. Please make sure the server is started.');
      return false;
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      const isServerRunning = await checkServerStatus();
      if (isServerRunning) {
        fetchConversations();
      }
      setLoading(false);
    };

    initializeApp();
    
    // Set up interval to refresh conversations
    const interval = setInterval(() => {
      if (serverStatus === 'running') {
        fetchConversations();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [serverStatus]);

  useEffect(() => {
    if (selectedChat && serverStatus === 'running') {
      fetchMessages(selectedChat);
    }
  }, [selectedChat, serverStatus]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_BASE}/conversations`);
      const conversationsWithDefaults = response.data.map(conv => ({
      _id: conv._id || 'unknown',
      user_name: conv.user_name || 'Unknown User',
      last_message: conv.last_message || 'No messages',
      last_timestamp: conv.last_timestamp || new Date(),
      unread_count: conv.unread_count || 0
    }));
      setConversations(conversationsWithDefaults);
      setError(null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. ' + error.message);
    }
  };

  const fetchMessages = async (wa_id) => {
    try {
      const response = await axios.get(`${API_BASE}/messages/${wa_id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. ' + error.message);
    }
  };

  const handleSendMessage = async (to, body) => {
    try {
      const response = await axios.post(`${API_BASE}/send-message`, { to, body });
      setMessages(prev => [...prev, response.data]);
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. ' + error.message);
    }
  };

  const getSelectedConversation = () => {
    return conversations.find(conv => conv._id === selectedChat) || null;
  };

  const importSampleData = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/import-sample-data`);
      fetchConversations();
      alert('Sample data imported successfully!');
    } catch (error) {
      console.error('Error importing sample data:', error);
      setError('Failed to import sample data. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const retryConnection = async () => {
    setLoading(true);
    setError(null);
    const isServerRunning = await checkServerStatus();
    if (isServerRunning) {
      fetchConversations();
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <div className="app">
      <div className="app-sidebar">
        <div className="sidebar-header">
          <h2>WhatsApp</h2>
          <button className="import-btn" onClick={importSampleData} disabled={serverStatus !== 'running'}>
            Import Sample Data
          </button>
        </div>
        
        {serverStatus !== 'running' && (
          <div className="error-message">
            <p>Backend server is not running on port 5002.</p>
            <button onClick={retryConnection} className="retry-btn">
              Retry Connection
            </button>
            <div className="server-help">
              <p>Make sure to:</p>
              <ol>
                <li>Navigate to the backend directory: <code>cd backend</code></li>
                <li>Install dependencies: <code>npm install</code></li>
                <li>Start the server: <code>npm run dev</code></li>
                <li>Server should be running on: <code>http://localhost:5002</code></li>
              </ol>
            </div>
          </div>
        )}
        
        {error && serverStatus === 'running' && (
          <div className="error-message">
            {error}
            <button onClick={retryConnection} className="retry-btn">
              Retry
            </button>
          </div>
        )}
        
        {serverStatus === 'running' && (
          <ChatList 
            conversations={conversations} 
            onSelectChat={setSelectedChat} 
            selectedChat={selectedChat}
          />
        )}
      </div>
      <div className="app-main">
        <ChatWindow 
          conversation={getSelectedConversation()}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default App;
