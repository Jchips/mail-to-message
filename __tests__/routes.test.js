'use strict';

const request = require('supertest');
const express = require('express');
const { checkEmails } = require('../src/clients/gmailClient');
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

jest.mock('../src/clients/gmailClient');
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'mockSid' }),
    },
  }));
});

let app;
let oAuth2Client;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  oAuth2Client = new google.auth.OAuth2();
  const tokens = { access_token: 'access-token' };
  oAuth2Client.getToken.mockResolvedValue({ tokens });
  oAuth2Client.setCredentials(tokens);
  app.use('/', createRouter(oAuth2Client));
});

afterAll(() => {
  jest.resetAllMocks();
});

describe('check getEmails route', () => {
  test('should return 404 if gmailUser contains @gmail.com', async () => {
    const response = await request(app).get('/getEmails/user@gmail.com');

    expect(response.status).toBe(404);
    expect(response.text).toBe('please only enter the username (the text before the @ symbol)');
  });

  test('should return 200 and check emails if gmailUser is valid', async () => {
    checkEmails.mockResolvedValue();
    const response = await request(app).get('/getEmails/validUser');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Checked emails and sent notifications if any.');
    expect(checkEmails).toHaveBeenCalledWith(oAuth2Client, 'validUser');
  });

  test('should return 500 if an error occurs', async () => {
    checkEmails.mockRejectedValue(new Error('Test error'));
    const response = await request(app).get('/getEmails/validUser');

    expect(response.status).toBe(500);
    expect(response.text).toBe('An error occurred.');
    expect(checkEmails).toHaveBeenCalledWith(oAuth2Client, 'validUser');
  });
});
