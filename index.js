'use strict';

require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure OAuth2 client using local-auth for easier setup
async function configureOAuth2Client() {
  const oauth2Client = await authenticate({
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    keyfilePath: 'client_secret.json', // Adjust the path to your credentials file
  });
  return oauth2Client;
}

configureOAuth2Client().then(oauth2Client => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Set up Twilio
  const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  function sendText(to, body) {
    twilioClient.messages.create({
      body: body,
      from: '+12532999750',
      to: to,
    })
      .then(message => console.log(`Message sent: ${message.sid}`))
      .catch(error => console.error(`Error sending message: ${error.message}`));
  }

  // Function to check emails
  async function checkEmails(gmailUser) {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: `from:${gmailUser}@gmail.com is:unread`,
    });

    const messages = res.data.messages || [];
    for (const message of messages) {
      await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });

      // Send a text message
      sendText('+18777804236', `You have a new email from ${gmailUser}!`);

      // Mark the email as read
      await gmail.users.messages.modify({
        userId: 'me',
        id: message.id,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });
    }
  }

  // Route to trigger email checking
  app.get('/check-emails/:gmailUser', async (req, res, next) => {
    try {
      let { gmailUser } = req.params;
      if (gmailUser.slice(-10) === '@gmail.com') {
        return res.status(404).send('please only enter the username (the text before the @ symbol)');
      }
      await checkEmails(gmailUser);
      res.status(200).send('Checked emails and sent notifications if any.');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred.');
    }
  });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
