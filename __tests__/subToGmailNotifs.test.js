'use strict';

const { google } = require('googleapis');
const { subToGmailPushNotifs } = require('../src/clients/gmailClient');

jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'mockSid' }),
    },
  }));
});

describe('subToGmailPushNotifs', () => {
  test('should return historyId when successful', async () => {

    // Mock watch() function
    const mockWatch = jest.fn().mockResolvedValue({
      data: { historyId: 'historyId123' },
    });

    google.gmail = jest.fn(() => ({ users: { watch: mockWatch } }));

    const mockOAuth2Client = {};
    const topicName = 'topic';
    const historyId = await subToGmailPushNotifs(mockOAuth2Client, topicName);

    expect(historyId).toBe('historyId123');
    expect(mockWatch).toBeCalledWith({
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX'],
        topicName: `projects/mail-to-message/topics/${topicName}`,
      },
    });
  });

  test('should return null on error', async () => {

    // Mock watch() function to throw an error
    const mockWatch = jest.fn().mockRejectedValue(new Error('Error occurred'));
    google.gmail = jest.fn(() => ({ users: { watch: mockWatch } }));

    const mockOAuth2Client = {};
    const topicName = 'topic';
    const historyId = await subToGmailPushNotifs(mockOAuth2Client, topicName);

    expect(historyId).toBeNull();
    expect(mockWatch).toBeCalledWith({
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX'],
        topicName: `projects/mail-to-message/topics/${topicName}`,
      },
    });
  });
});
