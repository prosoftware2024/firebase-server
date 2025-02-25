const http = require('http');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
 
const { sendNotification } = require('./index');

async function testNotification() {
  const options = {
    hostname: 'localhost',
    port: 3000,  
    path: '/sendNotification',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const data = JSON.stringify({
    userId: '1ckZqDQ3IMh6Qn3obH3TEcTqgJT2',
    title: 'Test Notification',
    body: 'This is a test notification from local Node.js environment.',
    type: 'test',
    data: { key1: 'value1', key2: 'value2' }
  });

  const req = http.request(options, res => {
    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', chunk => {
      console.log(`Response: ${chunk.toString()}`);
    });
  });

  req.on('error', error => {
    console.error(error);
  });

  req.write(data);
  req.end();
}

testNotification();
