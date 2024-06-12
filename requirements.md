# Software Requirements

## Vision

What is the vision of this product?

- The vision of this product is to help users stay on top of critical emails by allowing them to subscribe to text messages whenever an email gets sent to them from an important person.

What pain point does this project solve?

- This project solves the issue of people missing important emails.

Why should we care about your product?

- This product enhances personal and professional communication management.

## Scope (In/Out)

### IN - What will your product do

- Users will be able to authorize a gmail account to use Mail to Message
- Users will be able to type in a gmail user to subscribe to text messages for
- The server will check user's email for new messages from the above gmail user
- The server will send the user a text alert whenever the gmail user sends them a new email

### OUT - What will your product not do

- Users will not be able to read a whole email through a text message
- Users will not be able to subscribe to push notifications for email addresses with domains other than gmail

### Minimum Viable Product vs

What will your MVP functionality be?

- The MVP will be to send text messages when a user gets new emails from a specified user

What are your stretch goals?

- Sending the text automatically whenever a new email comes in from a user without the user needing to send a request to the server to check

### Stretch

What stretch goals are you going to aim for?

- All of them

## Functional Requirements

- Text messages will be sent whenever an gmail comes in from a certain user
- User will be able to pick which user they subscribe to text messages for
- User will be able to choose and change the gmail address used for Mail to Message

### Data Flow

![Data Flow Diagram](/src/assets/imgs/mail-to-message-flow-chart.png)

1. The user authorizes their email by sending a GET request to the server (route: `/auth`). The server will redirect the user to a page to authorize. Authorization is done with OAuth2.
2. Once the user's email is authorized they can subscribe to push notifications by sending a GET request to the `/getEmails` route with a `gmailUser` that they want to subscribe to text messages for.
3. Once subscribing, the server will check for new emails from the `gmailUser` right away and send text messages (using Twilio) if it finds any.
4. The server will continue to listen for new emails from the `gmailUser` and send text message alert whenever a new one is sent by automatically pushing to the subscription endpoint `/gmail/push`.

## Non-Functional Requirements

- Security: Using OAuth2 from Google to securely allow users to user Mail to Message with their gmail account while knowing directly what Mail to Message will have access to.

- Compatibility: Only gmail accounts will have compatibility with Mail to Message. This will reduce bugs by having the server deal with APIs from the same developers (Google) for email authorization, checking emails, and subscribing to push notifications.
