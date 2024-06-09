'use strict';

require('dotenv').config();
const express = require('express');
const oAuth2Client = require('./src/auth');
const createRouter = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(createRouter(oAuth2Client));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = app;
