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

describe('twilioClient', () => {
  test('sendText() does what it\'s supposed to', async () => {
    let mockTo = '+number';
    let mockBody = 'You have a new email from gmailUser';

    await sendText(mockTo, mockBody);

    let mockTwilio = twilio('twilio-sid', 'twilio-auth-token');
    const mock = mockTwilio.messages.create;

    expect(mock).toHaveBeenCalledWith({
      body: mockBody,
      from: '+12532999750',
      to: mockTo,
    });
    expect(console.log).toHaveBeenCalledWith('Message sent: mockSid');
  });
});
