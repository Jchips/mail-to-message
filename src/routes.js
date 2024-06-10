'use strict';

const express = require('express');
const { checkEmails, subToGmailPushNotifs } = require('./clients/gmailClient');

const router = express.Router();
let specifiedGmailUser;

/**
 * Creates the router.
 * Router is in a function for testing purposes.
 * @param {OAuth2Client} oAuth2Client - An instance of the Google OAuth2Client.
 * @returns - An instance of a express router.
 */
function createRouter(oAuth2Client) {

  // login to gmail route
  router.get('/auth', (req, res, next) => {
    try {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'],
      });
      console.log('authUrl', authUrl);
      res.redirect(authUrl);
    } catch (error) {
      res.status(500).send('Could not generate authorization URL.');
    }
  });

  // authorize gmail route
  router.get('/auth/redirect', async (req, res, next) => {
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
      await subToGmailPushNotifs(oAuth2Client, 'gmail-notifications');
      await checkEmails(oAuth2Client, gmailUser);
      res.status(200).send('Checked emails and sent notifications if any.');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred.');
    }
  });

  // subscription endpoint route (sends text messages)
  router.post('/gmail/push', async (req, res, next) => {
    const message = req.body.message;
    try {
      if (message) {
        await checkEmails(oAuth2Client, specifiedGmailUser);
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error processing Gmail push notification:', error.message);
      res.status(400).send('Error processing Gmail push notification: ' + error.message);
    }
  });

  return router;
}

module.exports = createRouter;
