const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://hotelbooking-b79a6.firebaseio.com'
});

const app = express();

// Enable CORS for all origins
app.use(cors({ origin: true }));

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Define the notification endpoint
app.post('/sendNotification', async (req, res) => {
  const { userId, title, body, type, data } = req.body;

  if (!userId || !title || !body) {
    return res.status(400).send({ error: 'Missing parameters: userId, title, and body are required.' });
  }

  try {
    // Fetch the user's FCM token from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();

    if (!userDoc.exists) {
      console.log(`User not found: ${userId}`);
      return res.status(404).send({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.log(`FCM token not found for user: ${userId}`);
      return res.status(404).send({ error: 'FCM token not found' });
    }

    // Construct the message payload
    const message = {
      notification: {
        title: title,
        body: body
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        type: type || 'general',
        ...data
      },
      token: fcmToken
    };

    // Send the message using Firebase Cloud Messaging
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return res.status(200).send({ result: 'Notification sent successfully', messageId: response });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).send({ error: error.message });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Notification service running on port ${port}`);
});
