'use strict';

require('dotenv').config();
const twilio = require('twilio');
const sendText = require('../src/clients/twilioClient');

jest.mock('twilio', () => {
  const mockTwilio = {
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'mockSid' }),
    },
  };
  return jest.fn().mockReturnValue(mockTwilio);
});

console.log = jest.fn();
console.error = jest.fn();

describe('twilioClient', () => {
  let mockTo = '+number';
  let mockBody = 'You have a new email from gmailUser';
  let mockTwilio = twilio('twilio-sid', 'twilio-auth-token');

  test('Logs \'message sent\' when sendText() is successful', async () => {
    await sendText(mockTo, mockBody);
    const mock = mockTwilio.messages.create;

    expect(mock).toHaveBeenCalledWith({
      body: mockBody,
      from: process.env.TWILIO_NUMBER,
      to: mockTo,
    });
    expect(console.log).toHaveBeenCalledWith('Message sent: mockSid');
  });

  test('should call console.error when sendText() throws an error', async () => {
    mockTwilio.messages.create.mockRejectedValue(new Error('Test error'));
    await sendText(mockTo, mockBody);

    expect(console.error).toHaveBeenCalledWith('Error sending message: Test error');
  });
});
