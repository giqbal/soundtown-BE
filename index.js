const serverless = require('serverless-http');
const express = require('express');
const apiRouter = require('./routes/api');

const app = express();

app.use('/api/', apiRouter);

app.use('*', (req, res, next) => {
  next({ status: 404, message: 'Page not found' });
});

module.exports = { handler: serverless(app), app };
