const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const webhookRoutes = require('./routes/webhooks');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'], // Your React app's URL
  credentials: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', webhookRoutes);

// Health check endpoint

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});



// Import sample data endpoint
app.post('/api/import-sample-data', async (req, res) => {
  try {
    const { processWebhookPayload } = require('./utils/payloadProcessor');
    const fs = require('fs');
    const path = require('path');
    
    const sampleDir = path.join(__dirname, '../sample-data');
    const files = fs.readdirSync(sampleDir);
    
    let processedCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(sampleDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const payload = JSON.parse(data);
          
          await processWebhookPayload(payload);
          processedCount++;
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
        }
      }
    }
    
    res.json({ 
      message: `Processed ${processedCount} sample files`, 
      count: processedCount 
    });
  } catch (error) {
    console.error('Error importing sample data:', error);
    res.status(500).send('Error importing sample data');
  }
});


app.listen(5002, () => {
  console.log(`Server running on port 5002`);
});