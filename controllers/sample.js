const aws = require('aws-sdk');
const axios = require('axios');
const asyncPolling = require('async-polling');
const {
  CLOUDCONVERT_API_KEY,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  SONICAPI_ACCESS_ID,
} = process.env.NODE_ENV ? process.env : require('../config');

const processSample = (req, res, next) => {
  const s3 = new aws.S3();
  const convertedBucket = 'soundtown.converted.sample';
  const convertedFileName = 'converted_recording.mp3';
  const midiNumLookUp = {
    c3: 48,
    d3: 50,
    e3: 52,
    f3: 53,
    g3: 55,
    a3: 57,
    b3: 59,
    c4: 60,
    d4: 62,
    e4: 64,
    f4: 65,
    g4: 67,
  };
  let checkQueueStatus;
  const tones = Object.keys(midiNumLookUp);
  const { file } = req;
  axios.post('https://api.cloudconvert.com/convert', {
    apikey: CLOUDCONVERT_API_KEY,
    inputformat: 'caf',
    outputformat: 'mp3',
    input: 'download',
    file: file.location,
    output: {
      s3: {
        accesskeyid: AWS_ACCESS_KEY_ID,
        secretaccesskey: AWS_SECRET_ACCESS_KEY,
        bucket: convertedBucket,
        region: 'eu-west-2',
        path: convertedFileName,
        acl: 'public-read',
      },
    },
    wait: true,
    download: false,
  })
    .then(({ data }) => {
      if (data.message === 'Saved file to S3') {
        return s3.deleteObject({ Bucket: file.bucket, Key: file.key }).promise();
      }
    })
    .then(() => {
      const toneQueries = tones.map(tone => axios.get(`https://api.sonicAPI.com/process/elastiqueTune?access_id=${SONICAPI_ACCESS_ID}&input_file=https://s3.eu-west-2.amazonaws.com/${convertedBucket}/${convertedFileName}&blocking=false&format=json&pitchcorrection_percent=100&midi_pitches=${midiNumLookUp[tone]}-...`));
      return Promise.all(toneQueries);
    })
    .then((queueInfo) => {
      checkQueueStatus = asyncPolling((end) => {
        const checkStatuses = queueInfo.map(conversion => axios.get(`https://api.sonicapi.com/file/status?access_id=${SONICAPI_ACCESS_ID}&file_id=${conversion.data.file.file_id}&format=json`));
        Promise.all(checkStatuses)
          .then((statuses) => {
            end(null, statuses);
          });
      }, 100);
      checkQueueStatus.run();
      checkQueueStatus.on('result', (currentStatuses) => {
        if (currentStatuses.every(({ data }) => data.file.status === 'ready')) {
          checkQueueStatus.stop();
          const convertedTones = tones.reduce((acc, tone, index) => {
            acc[tone] = `https://api.sonicapi.com/file/download?access_id=${SONICAPI_ACCESS_ID}&file_id=${currentStatuses[index].data.file.file_id}`;
            return acc;
          }, {});
          res.send({ convertedTones });
        }
      });
    })
    .catch(next);
};

module.exports = { processSample };
