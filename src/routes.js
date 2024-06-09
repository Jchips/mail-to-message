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

  // Function to get email details
  async function getEmailDetails(gmail, messageId) {
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });
    return res.data;
  }

  router.post('/gmail/push', async (req, res) => {
    console.log('req.body', req.body); // delete later
    const message = req.body.message;
    try {
      if (message) {
        // const message = req.body.message;
        const data = Buffer.from(message.data, 'base64').toString('utf-8');
        const notification = JSON.parse(data);
        console.log('🚀 ~ router.post ~ notification:', notification);

        if (data.emailAddress && data.historyId) {
          console.log(`Received notification for email address: ${data.emailAddress}`);

          const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

          const history = await gmail.users.history.list({
            userId: 'me',
            startHistoryId: data.historyId,
          });

          // Extract message ID
          if (history.data.history && history.data.history.length > 0) {
            const messageId = history.data.history[0].messages[0].id;

            // Get the email details
            const emailDetails = await getEmailDetails(gmail, messageId);

            // Extract the sender's email address from the email headers
            const headers = emailDetails.payload.headers;
            const fromHeader = headers.find(header => header.name === 'From');
            if (fromHeader) {
              const senderEmail = fromHeader.value;

              // Filter based on the sender's email address
              if (senderEmail.includes(specifiedGmailUser)) {
                await checkEmails(oAuth2Client, specifiedGmailUser);
              }
            }
          }
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
