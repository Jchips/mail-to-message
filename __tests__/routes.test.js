'use strict';

const request = require('supertest');
const express = require('express');
const { authenticate } = require('@google-cloud/local-auth');
const { OAuth2Client } = require('google-auth-library');
const configureOAuth2Client = require('../src/auth');
const checkEmails = require('../src/clients/gmailClient');
const routes = require('../src/routes');

jest.mock('@google-cloud/local-auth');
jest.mock('../src/clients/gmailClient');
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'mockSid' }),
    },
  }));
});

let app;
let oauth2Client;

beforeAll(async () => {
  authenticate.mockResolvedValue(new OAuth2Client({
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'test-redirect-uri',
  }));

  app = express();
  const router = express.Router();

  await configureOAuth2Client().then(oauth2Client => {
    router.get('/getEmails/:gmailUser', async (req, res) => {
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

  app.use('/', routes);
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
    expect(checkEmails).toHaveBeenCalledWith(oauth2Client, 'validUser');
  });

  test('should return 500 if an error occurs', async () => {
    checkEmails.mockRejectedValue(new Error('Test error'));
    const response = await request(app).get('/getEmails/validUser');

    expect(response.status).toBe(500);
    expect(response.text).toBe('An error occurred.');
    expect(checkEmails).toHaveBeenCalledWith(oauth2Client, 'validUser');
  });
});
