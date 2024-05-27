'use strict';

const twilio = require('twilio');

// Set up Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function sendText(to, body) {
  twilioClient.messages.create({
    body: body,
    from: '+12532999750',
    to: to,
  })
    .then(message => console.log(`Message sent: ${message.sid}`))
    .catch(error => console.error(`Error sending message: ${error.message}`));
}

module.exports = sendText;
