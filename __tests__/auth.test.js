'use strict';

const { authenticate } = require('@google-cloud/local-auth');
const { OAuth2Client } = require('google-auth-library');
const configureOAuth2Client = require('../src/auth');

jest.mock('@google-cloud/local-auth');

describe('configureOAuth2Client', () => {
  it('should return an instance of OAuth2Client', async () => {
    authenticate.mockResolvedValue(new OAuth2Client({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'test-redirect-uri',
    }));

    const oauth2Client = await configureOAuth2Client();

    expect(oauth2Client).toBeInstanceOf(OAuth2Client);
    expect(oauth2Client._clientId).toBe('test-client-id');
    expect(oauth2Client._clientSecret).toBe('test-client-secret');
    expect(oauth2Client.redirectUri).toBe('test-redirect-uri');
  });
});
