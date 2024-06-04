'use strict';

const { authenticate } = require('@google-cloud/local-auth');

/**
 * Configures OAuth2 client
 * @returns {Oauth2Client} - An instance of OAuth2Client
 */
async function configureOAuth2Client() {
  const oauth2Client = await authenticate({
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    keyfilePath: 'client_secret.json',
  });
  return oauth2Client;
}

module.exports = configureOAuth2Client;
