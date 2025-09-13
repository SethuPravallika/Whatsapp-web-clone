const http = require('http');

console.log('Testing connection to backend server...');

const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log('✅ SUCCESS: Backend server is running on port 5002');
  console.log('Status Code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.log('❌ ERROR: Cannot connect to backend server');
  console.log('Error message:', err.message);
  console.log('\nPlease make sure:');
  console.log('1. Your backend server is running: cd backend && npm run dev');
  console.log('2. The server is using port 5002');
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ TIMEOUT: Connection to backend server timed out');
  req.destroy();
  process.exit(1);
});

req.end();