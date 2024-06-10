'use strict';

const request = require('supertest');
const express = require('express');
const { google } = require('googleapis');
const createRouter = require('../src/routes');

jest.mock('googleapis', () => {
  const mockOAuth2Client = {
    generateAuthUrl: jest.fn(),
    getToken: jest.fn(),
    setCredentials: jest.fn(),
  };
  return {
    google: {
      auth: {
        OAuth2: jest.fn(() => mockOAuth2Client),
      },
    },
  };
});

jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'mockSid' }),
    },
  }));
});

let app;
let oAuth2Client;
const authUrl = 'https://mock.auth.url';

beforeAll(() => {
  app = express();
  oAuth2Client = new google.auth.OAuth2();
  app.use('/', createRouter(oAuth2Client));
});

beforeEach(() => {
  oAuth2Client.generateAuthUrl.mockReturnValue(authUrl);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('OAuth2 authorization', () => {
  test('GET /auth should redirect to Google OAuth2 URL', async () => {
    const response = await request(app).get('/auth');

    expect(oAuth2Client.generateAuthUrl).toHaveBeenCalledWith({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'],
    });
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(authUrl);
  });

  test('GET /auth should return 500 if there\'s no oAuth2client', async () => {
    oAuth2Client.generateAuthUrl.mockImplementation(() => {
      throw new Error('Test error');
    });
    const response = await request(app).get('/auth');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Could not generate authorization URL.');
  });

  test('GET /auth/redirect should return 400 if authorization code is missing', async () => {
    const response = await request(app).get('/auth/redirect');

    expect(response.status).toBe(400);
    expect(response.text).toBe('Authorization code missing.');
  });

  test('GET /auth/redirect should handle OAuth2 callback and set credentials', async () => {
    const tokens = { access_token: 'access-token' };
    oAuth2Client.getToken.mockResolvedValue({ tokens });
    const response = await request(app).get('/auth/redirect').query({ code: 'fake-code' });

    expect(oAuth2Client.getToken).toHaveBeenCalledWith('fake-code');
    expect(oAuth2Client.setCredentials).toHaveBeenCalledWith(tokens);
    expect(response.status).toBe(200);
    expect(response.text).toBe('Authorization successful. You can now access Gmail.');
  });

  test('GET /auth/redirect should handle errors during token retrieval', async () => {
    oAuth2Client.getToken.mockRejectedValue(new Error('Error retrieving access token'));
    const response = await request(app).get('/auth/redirect').query({ code: 'fake-code' });

    expect(oAuth2Client.getToken).toHaveBeenCalledWith('fake-code');
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error retrieving access token.');
  });
});
