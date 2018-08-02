const reverbRouter = require('express').Router();
const { processReverb } = require('../controllers/reverb');

reverbRouter.route('/')
  .get(processReverb);

module.exports = reverbRouter;
