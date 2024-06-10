'use strict';

require('dotenv').config();
const express = require('express');
const oAuth2Client = require('./src/auth');
const createRouter = require('./src/routes');
const notFound = require('./src/errorHandlers/404');
const errorHandler = require('./src/errorHandlers/500');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

app.use(createRouter(oAuth2Client));

app.use('*', notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = app;
