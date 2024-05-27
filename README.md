# Mail to Message

## We are deployed on _____

[project url here]

---------------------------------

## Web Application

***[Explain your app, should be at least a paragraph. What does it do? Why should I use? Sell your product!]***

This is a server-side application written in JavaScript using Node.js.

An interface is provided to create new blog
posts, view existing blog posts, edit existing blog posts, delete existing
blog posts, and search by both keywords and user names. All blog posts can be
enriched using Azure Language Services (part of Microsoft's Cognitive Services
suite), Bing Image API, and Parallel Dots (for automated tagging of posts via
key phrases detected within the post's body). Image enrichments can be added
based on the overall sentiment score (a range 0.0 - 1.0 related to the mood
of the post) and key phrases / keywords detected in the posts. Optionally, users
can choose to opt-out of these features for privacy or data collection concerns.

---------------------------------

## Tools Used

Microsoft Visual Studio

- Node.js
- Express
- Gmail API
- Twilio

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

---------------------------------

## Usage

***[Provide some images of your app that shows how it can be used with brief description as title]***

### Sending an email

![Sending an email](https://via.placeholder.com/500x250)

### Viewing text messages

![Virtual phone on Twilio](https://via.placeholder.com/500x250)

## Data Flow (Frontend, Backend, REST API)

***[Add a clean and clear explanation of what the data flow is. Walk me through it.]***
![Data Flow Diagram](/assets/img/Flowchart.png)

## Authors

Jelani (Jaye) Rhinehart
