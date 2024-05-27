'use strict';

require('dotenv').config();
const express = require('express');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(routes); // check email route

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
