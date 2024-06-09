'use strict';

const twilio = require('twilio');

// Twilio set up
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendText(to, body) {
  try {
    let message = await twilioClient.messages.create({
      body: body,
      from: process.env.TWILIO_NUMBER, // Twilio number
      to: to,
    });
    console.log(`Message sent: ${message.sid}`);
  } catch (error) {
    console.error(`Error sending message: ${error.message}`);
  }
}

module.exports = sendText;
