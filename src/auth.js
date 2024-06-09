'use strict';

const { OAuth2Client } = require('google-auth-library');

const oAuth2Client = new OAuth2Client({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});

module.exports = oAuth2Client;
