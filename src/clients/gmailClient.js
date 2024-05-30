'use strict';

const { google } = require('googleapis');
const sendText = require('../clients/twilioClient');

// Function to check emails
async function checkEmails(oauth2Client, gmailUser) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  console.log(gmail); // delete later

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

module.exports = checkEmails;
