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
    const email = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
    });

    const subject = email.data.payload.headers.find(header => header.name === 'Subject').value;
    const emailLink = `https://mail.google.com/mail/u/0/#inbox/${message.id}`;

    // Sends a text message to virtual Twilio phone
    sendText(process.env.TWILIO_VIRTUAL_PHONE, `You have a new email from ${gmailUser}!\n${subject}\n${emailLink}`);

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
async function subToGmailPushNotifs(oAuth2Client, topicName) {
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  try {
    const res = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX'],
        topicName: `projects/mail-to-message/topics/${topicName}`,
      },
    });

    console.log('Watch response:', res.data);
    return res.data.historyId;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
   * Gets email details
   * @param {gmail_v1.Gmail} gmail - Gmail API Client
   * @param {String} messageId - The messageId of the retrieved email
   * @returns {Object} - Details about the retrieved email
   */
async function getEmailDetails(gmail, messageId) {
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
  });
  return res.data;
}

module.exports = { checkEmails, subToGmailPushNotifs, getEmailDetails };
