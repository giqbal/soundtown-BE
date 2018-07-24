const sampleRouter = require('express').Router();
const { processSample } = require('../controllers/sample');

sampleRouter.route('/')
  .post(processSample);

module.exports = sampleRouter;
