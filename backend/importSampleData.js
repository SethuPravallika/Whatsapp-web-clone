require('dotenv').config();
const mongoose = require('mongoose');
const { processWebhookPayload } = require('./utils/payloadProcessor');
const fs = require('fs');
const path = require('path');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB Atlas');
  
  try {
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
          console.log(`Processed ${file}`);
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
        }
      }
    }
    
    console.log(`Successfully processed ${processedCount} sample files`);
    process.exit(0);
  } catch (error) {
    console.error('Error importing sample data:', error);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});