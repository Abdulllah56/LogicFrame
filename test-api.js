const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/ai/generate-email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({
  mode: 'email',
  project: { clientName: "Test", projectName: "Test" },
  requests: [],
  config: { tone: "Friendly", intent: "Discuss", length: "Short" },
  senderName: "Test Sender"
}));
req.end();
