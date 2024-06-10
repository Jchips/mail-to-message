'use strict';

require('dotenv').config();
const { google } = require('googleapis');
const { checkEmails } = require('../src/clients/gmailClient');
const sendText = require('../src/clients/twilioClient');

jest.mock('googleapis', () => {
  const mockGmail = {
    users: {
      messages: {
        list: jest.fn(),
        get: jest.fn(),
        modify: jest.fn(),
      },
    },
  };
  return {
    google: {
      gmail: jest.fn().mockReturnValue(mockGmail),
    },
  };
});

// sendText() mock
jest.mock('../src/clients/twilioClient', () => {
  return jest.fn();
});

let oauth2Client;
let gmailUser;

beforeEach(() => {
  oauth2Client = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'test-redirect-uri',
  };
  gmailUser = 'gmailuser';
});

describe('gmailClient', () => {
  test('calls sendText() with correct arguments', async () => {
    const mockGmail = google.gmail();
    const messages = [{ id: '1' }];

    mockGmail.users.messages.list.mockResolvedValue({ data: { messages } });
    mockGmail.users.messages.get.mockResolvedValue({ data: { id: '1', snippet: 'Test email', payload: { headers: [{ name: 'Subject', value: 'email subject' }] } } });
    mockGmail.users.messages.modify.mockResolvedValue({ data: { id: '1', labelIds: [] } });

    await checkEmails(oauth2Client, gmailUser);

    expect(sendText).toHaveBeenCalledWith(process.env.TWILIO_VIRTUAL_PHONE, 'You have a new email from gmailuser!\nemail subject\nhttps://mail.google.com/mail/u/0/#inbox/1');
  });
});
