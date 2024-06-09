'use strict';

const express = require('express');
const checkEmails = require('./clients/gmailClient');

const router = express.Router();

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
      await checkEmails(oAuth2Client, gmailUser);
      res.status(200).send('Checked emails and sent notifications if any.');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred.');
    }
  });
  return router;
}

module.exports = createRouter;
