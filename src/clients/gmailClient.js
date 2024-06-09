'use strict';

const { google } = require('googleapis');
const sendText = require('../clients/twilioClient');

// Checks emails and then sends text to virtual Twilio phone
async function checkEmails(oAuth2Client, gmailUser) {
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

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

    // Sends a text message to virtual Twilio phone
    sendText(process.env.TWILIO_VIRTUAL_PHONE, `You have a new email from ${gmailUser}!`);

    // Marks the email as read
    await gmail.users.messages.modify({
      userId: 'me',
      id: message.id,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
  }
}

// Subscribes to the Gmail Pub/Sub topic
async function subscribeToGmailPushNotifs(oAuth2Client, topicName) {
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  try {
    const res = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX'],
        topicName: `projects/mail-to-message/topics/${topicName}`,
      },
    });

    console.log('Watch response:', res.data); // delete later
    if (res.data.historyId) {
      return res.data.historyId;
    }
    return null;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { checkEmails, subscribeToGmailPushNotifs };
