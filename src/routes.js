'use strict';

const express = require('express');
const { google } = require('googleapis');
const { checkEmails, subscribeToGmailPushNotifs } = require('./clients/gmailClient');

const router = express.Router();
let specifiedGmailUser;
let storedHistoryId;

/**
 * Creates the router.
 * Router is in a function for testing purposes.
 * @param {OAuth2Client} oAuth2Client - The Google OAuth2Client.
 * @returns - An instance of a express router.
 */
function createRouter(oAuth2Client) {

  // login to gmail route
  router.get('/auth', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'],
    });
    console.log('authUrl', authUrl);
    res.redirect(authUrl);
  });

  // authenticate gmail route
  router.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send('Authorization code missing.');
    }
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      res.status(200).send('Authorization successful. You can now access Gmail.');
    } catch (error) {
      console.error('Error retrieving access token:', error);
      res.status(500).send('Error retrieving access token.');
    }
  });

  // subscribe to get notifications from specific gmail user route
  router.get('/getEmails/:gmailUser', async (req, res, next) => {
    try {
      let { gmailUser } = req.params;
      if (gmailUser.slice(-10) === '@gmail.com') {
        return res.status(404).send('please only enter the username (the text before the @ symbol)');
      }
      specifiedGmailUser = gmailUser;
      storedHistoryId = await subscribeToGmailPushNotifs(oAuth2Client, 'gmail-notifications');
      await checkEmails(oAuth2Client, gmailUser);
      res.status(200).send('Checked emails and sent notifications if any.');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred.');
    }
  });

  // subscription endpoint route (sends text messages)
  router.post('/gmail/push', async (req, res) => {
    const message = req.body.message;
    try {
      if (message) {
        if (storedHistoryId) {
          const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
          const history = await gmail.users.history.list({
            userId: 'me',
            startHistoryId: storedHistoryId,
            historyTypes: ['messageAdded'],
          });

          // Extract message ID
          if (history.data.history && history.data.history.length > 0) {
            const messageId = history.data.history[0].messages[0].id;
            const emailDetails = await getEmailDetails(gmail, messageId);

            // Extract the sender's email address from the email headers and filter
            const headers = emailDetails.payload.headers;
            const fromHeader = headers.find(header => header.name === 'From');
            if (fromHeader) {
              const senderEmail = fromHeader.value;
              console.log('🚀 ~ router.post ~ senderEmail:', senderEmail); // delete later
              if (senderEmail.slice(0, -10) === specifiedGmailUser) {
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

  return router;
}

module.exports = createRouter;
