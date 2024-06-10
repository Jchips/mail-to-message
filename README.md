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
- Twilio Messaging API
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

Will need to create Twilio account, get a Twilio phone number, create a Google Developers account, create a new Google project and enable the Gmail and Cloud Pub/Sub APIs for it. For the Cloud Pub/Sub API, create a topic and subscription. The topic must have the principle `gmail-api-push@system.gserviceaccount.com` with the `Pub/Sub Publisher`. Check the [.env.sample](/.env.sample) for necessary environment variables for the project.

---------------------------------

## Usage

### Gmail auth

![Authorizing gmail](/src/assets/imgs/gmail-auth-1.png)

When sending a GET request to `/auth`, user should be redirected to a screen that looks like this to login to their Google account for Mail to Message. If user is already logged in to any Google accounts, the screen will let them choose one of the accounts to give Mail to Message authorization to. Mail to Message will ask for permissions to read and modify emails for user's gmail account.

![Gmail authorized confirmation](/src/assets/imgs/gmail-auth-2.png)

Message after gmail is authorized. Now user can subscribe to text messages from a gmail user.

### Subscribe to text messages from a gmail user

![Using GET /getEmails route](/src/assets/imgs/getEmails-route.png)

Choose a gmail user to subscribe to text messages to with a GET request to `/getEmails/:gmailUser`. The `gmailUser` should only contain the gmail username (only the part before '@gmail.com').

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
