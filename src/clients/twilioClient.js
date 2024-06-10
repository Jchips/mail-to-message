'use strict';

const twilio = require('twilio');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Sends a text message.
 * @param {String} to - Phone number to send text message to.
 * @param {String} body - Message to send.
 */
async function sendText(to, body) {
  try {
    let message = await twilioClient.messages.create({
      body: body,
      from: process.env.TWILIO_NUMBER,
      to: to,
    });
    console.log(`Message sent: ${message.sid}`);
  } catch (error) {
    console.error(`Error sending message: ${error.message}`);
  }
}

module.exports = sendText;
