const app = require('express')();
const cors = require('cors');
const apiRouter = require('./routes/api');

app.use(cors());

app.use('/api/', apiRouter);

app.use('*', (req, res, next) => {
  next({ status: 404, message: 'Page not found' });
});

app.use((err, req, res, next) => {
  res.status(500).send({ err });
});

module.exports = app;
