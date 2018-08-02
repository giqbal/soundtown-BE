const aws = require('aws-sdk');
const axios = require('axios');
const asyncPolling = require('async-polling');
const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  SONICAPI_ACCESS_ID,
} = process.env.NODE_ENV ? process.env : require('../config');
const { convertToMp3 } = require('../utils');

const s3 = new aws.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});
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

const processSample = (req, res, next) => {
  const { file } = req;
  const convertedBucket = 'soundtown.converted.sample';
  const toneBucket = 'soundtown.pitched.audio';
  const tones = Object.keys(midiNumLookUp);
  if (file === undefined) res.status(415).send({ message: 'Sorry, could not find any media attached to the request' });
  // else if (file.mimetype !== 'audio/x-caf') res.status(415).send({ message: 'Recording not in .caf file format' });
  else {
    const instanceFolder = file.key.split('/')[0];
    const convertedFileName = `${instanceFolder}/converted_recording.mp3`;
    convertToMp3(file, convertedBucket, convertedFileName)
      .then(({ data, status }) => {
        if (data.message === 'Saved file to S3') {
          s3.deleteObject({ Bucket: file.bucket, Key: file.key }).promise();
        } else throw new Error({ status, message: data });
      })
      .then(() => {
        const toneQueries = tones.map(tone => axios.get(`https://api.sonicAPI.com/process/elastiqueTune?access_id=${SONICAPI_ACCESS_ID}&input_file=https://s3.eu-west-2.amazonaws.com/${convertedBucket}/${convertedFileName}&blocking=false&format=json&pitchcorrection_percent=100&midi_pitches=${midiNumLookUp[tone]}-...`));
        return Promise.all(toneQueries);
      })
      .then((queueInfo) => {
        const tonesToBuffer = [];
        checkQueueStatus = asyncPolling((end) => {
          const checkStatuses = queueInfo.map(conversion => axios.get(`https://api.sonicapi.com/file/status?access_id=${SONICAPI_ACCESS_ID}&file_id=${conversion.data.file.file_id}&format=json`));
          Promise.all(checkStatuses)
            .then((statuses) => {
              end(null, statuses);
            });
        }, 50);

        checkQueueStatus.run();

        checkQueueStatus.on('result', (currentStatuses) => {
          if (currentStatuses.every(({ data }) => data.file.status === 'ready')) {
            checkQueueStatus.stop();
            s3.deleteObject({ Bucket: convertedBucket, Key: convertedFileName }).promise();
            tonesToBuffer = currentStatuses.map(status => axios(`https://api.sonicapi.com/file/download?access_id=${SONICAPI_ACCESS_ID}&file_id=${status.data.file.file_id}&format=mp3-cbr`, {
              responseType: 'arraybuffer',
            }));
            Promise.all(tonesToBuffer)
              .then((toneBuffers) => {
                console.log(toneBuffers);
                const storeToS3 = tones.map((tone, index) => s3.putObject({
                  Body: toneBuffers[index].data,
                  Bucket: toneBucket,
                  Key: `${instanceFolder}/${tone}.mp3`,
                  ACL: 'public-read',
                }).promise());
                return Promise.all(storeToS3);
              })
              .then(() => {
                const convertedTones = tones.reduce((acc, tone) => {
                  acc[tone] = `https://s3.eu-west-2.amazonaws.com/${toneBucket}/${instanceFolder}/${tone}.mp3`;
                  return acc;
                }, {});
                res.send({ convertedTones });
              })
              .catch(console.log);
          }
        });
      })
      .catch(console.log);
  }
};

module.exports = { processSample, midiNumLookUp };
