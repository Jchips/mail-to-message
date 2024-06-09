'use strict';

const express = require('express');
const { google } = require('googleapis');
const { checkEmails, subscribeToGmailPushNotifs } = require('./clients/gmailClient');

const router = express.Router();
let specifiedGmailUser;

function createRouter(oAuth2Client) {
  router.get('/auth', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'],
    });
    console.log('authUrl', authUrl);
    res.redirect(authUrl);
  });

  router.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send('Authorization code missing.');
    }
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      // await subscribeToGmailPushNotifs(oAuth2Client, 'gmail-notifications');
      res.status(200).send('Authorization successful. You can now access Gmail.');
    } catch (error) {
      console.error('Error retrieving access token:', error);
      res.status(500).send('Error retrieving access token.');
    }
  });

  router.get('/getEmails/:gmailUser', async (req, res, next) => {
    try {
      let { gmailUser } = req.params;
      if (gmailUser.slice(-10) === '@gmail.com') {
        return res.status(404).send('please only enter the username (the text before the @ symbol)');
      }
      specifiedGmailUser = gmailUser;
      await subscribeToGmailPushNotifs(oAuth2Client, 'gmail-notifications');
      await checkEmails(oAuth2Client, gmailUser);
      res.status(200).send('Checked emails and sent notifications if any.');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred.');
    }
  });

  router.post('/gmail/push', async (req, res) => {
    console.log('req.body', req.body); // delete later
    const message = req.body.message;
    try {
      // if (!req.body || !req.body.message) {
      //   console.log('No messages in the Pub/Sub notification');
      //   return res.status(204).send(); // Respond with a 204 No Content status
      // }
      if (message) {
        // const message = req.body.message;
        const data = Buffer.from(message.data, 'base64').toString('utf-8');
        const notification = JSON.parse(data);
        console.log('🚀 ~ router.post ~ notification:', notification);

        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        // const messageId = notification.email.messageId;
        const messageId = message.messageId;

        // Get the details of the new email
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: messageId,
        });
        console.log('🚀 ~ router.post ~ email:', email);

        // Check emails from the user mentioned in the notification (adjust as necessary)
        // await checkEmails(oAuth2Client, notification.gmailUser);

        // Check if the email is from the specified user
        const headers = email.data.payload.headers;
        const fromHeader = headers.find(header => header.name === 'From');
        const fromEmail = fromHeader ? fromHeader.value : '';

        if (fromEmail.includes(specifiedGmailUser)) {
          // Send notification if the email is from the specified user
          await checkEmails(oAuth2Client, specifiedGmailUser);
        }
      }
      res.status(204).send(); // Respond with a 204 No Content status
    } catch (error) {
      console.error('Error processing Gmail push notification:', error.message);
      res.status(400).send('Error processing Gmail push notification: ' + error.message);
    }
  });

  return router;
}

module.exports = createRouter;
