const axios = require('axios');
const asyncPolling = require('async-polling');
const { midiNumLookUp } = require('./sample');
const { SONICAPI_ACCESS_ID } = process.env.NODE_ENV ? process.env : require('../config');

const processReverb = (req, res, next) => {
  const { instance } = req.query;
  const toneBucket = 'soundtown.pitched.audio';
  const tones = Object.keys(midiNumLookUp);
  const getReverbedTones = tones.map(tone => axios.get(`https://api.sonicAPI.com/process/reverb?access_id=${SONICAPI_ACCESS_ID}&input_file=https://s3.eu-west-2.amazonaws.com/${toneBucket}/${instance}/${tone}.mp3&blocking=false&format=json&preset=large_hall&wetness=1`));
  Promise.all(getReverbedTones)
    .then((reverbQueue) => {
      const checkQueueStatus = asyncPolling((end) => {
        const checkStatuses = reverbQueue.map(conversion => axios.get(`https://api.sonicapi.com/file/status?access_id=${SONICAPI_ACCESS_ID}&file_id=${conversion.data.file.file_id}&format=json`));
        Promise.all(checkStatuses)
          .then((queueStatus) => {
            end(null, queueStatus);
          });
      }, 50);

      checkQueueStatus.run();

      checkQueueStatus.on('result', (currentStatuses) => {
        if (currentStatuses.every(({ data }) => data.file.status === 'ready')) {
          checkQueueStatus.stop();
          const reverbedTones = tones.reduce((acc, tone, index) => {
            acc[tone] = `https://api.sonicapi.com/file/download?access_id=${SONICAPI_ACCESS_ID}&file_id=${currentStatuses[index].data.file.file_id}&format=mp3-cbr`;
            return acc;
          }, {});
          res.send({ reverbedTones });
        }
      });
    })
    .catch(next);
};

module.exports = { processReverb };
