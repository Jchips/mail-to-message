'use strict';

const express = require('express');
const configureOAuth2Client = require('./auth');
const checkEmails = require('./clients/gmailClient');

const router = express.Router();


configureOAuth2Client().then(oauth2Client => {
  // Route to trigger email checking
  router.get('/getEmails/:gmailUser', async (req, res, next) => {
    try {
      let { gmailUser } = req.params;
      if (gmailUser.slice(-10) === '@gmail.com') {
        return res.status(404).send('please only enter the username (the text before the @ symbol)');
      }
      await checkEmails(oauth2Client, gmailUser);
      res.status(200).send('Checked emails and sent notifications if any.');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred.');
    }
  });
});

module.exports = router;
