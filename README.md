# Mail to Message

## Deployed on Render.com

[https://mail-to-message.onrender.com](https://mail-to-message.onrender.com)

---------------------------------

## Web Application

This is a server-side application written in JavaScript using Node.js.

In today's fast-paced world, individuals often receive many critical emails that require immediate attention. However, people may not constantly check their emails and can miss important messages. Mail to Message is a server-side application that sends text message alerts for specific important emails to ensure timely responses, enhancing personal and professional communication management.

---------------------------------

## Tools Used

Microsoft Visual Studio

- Node.js
- Express
- Gmail API
- Google Cloud Pub/Sub API
- Twilio
- Jest
- Supertest

---------------------------------

## Getting Started

Clone this repository to your local machine.

```bash
git clone https://github.com/Jchips/mail-to-messages.git
```

Once downloaded, you can either use the dotnet CLI utilities or Visual Studio 2017 (or greater) to build the web application.

```bash
cd mail-to-message
`npm i`
```

```bash
cd mail-to-messages
npm start
```

Will need to create Twilio account, get a Twilio phone number, create a Google Developers account and enable the Gmail and Cloud Pub/Sub APIs.

---------------------------------

## Usage

### Sending an email

![Sending an email](https://via.placeholder.com/500x250)

### Viewing text messages

![Virtual phone on Twilio](/src/assets/imgs/twilio-virtual-phone.png)

Viewing your received text messages on your phone. For the Twilio virtual phone, you must be logged into your Twilio account.

## Data Flow

![Data Flow Diagram](/src/assets/imgs/mail-to-message-flow-chart.png)

1. The user authorizes their email by sending a GET request to the server (route: `/auth`). The server will redirect the user to a page to authorize. Authorization is done with OAuth2.
2. Once the user's email is authorized they can subscribe to push notifications by sending a GET request to the `/getEmails` route with a `gmailUser` that they want to subscribe to text messages for.
3. Once subscribing, the server will check for new emails from the `gmailUser` right away and send text messages (using Twilio) if it finds any.
4. The server will continue to listen for new emails from the `gmailUser` and send text message alert whenever a new one is sent by automatically pushing to the subscription endpoint `/gmail/push`.

## Author

Jelani (Jaye) Rhinehart
