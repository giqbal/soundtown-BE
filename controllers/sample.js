const aws = require('aws-sdk');
const axios = require('axios');
const { CLOUDCONVERT_API_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env.NODE_ENV ? process.env : require('../config');

const s3 = new aws.S3();
const sampleBucket = 'soundtown.sample';
const convertedBucket = 'soundtown.converted.sample';

const processSample = (req, res, next) => {
  s3.listObjectsV2({ Bucket: sampleBucket, MaxKeys: 1 }, (err, { Contents }) => {
    if (err) throw err;
    else {
      axios.post('https://api.cloudconvert.com/convert', {
        apikey: CLOUDCONVERT_API_KEY,
        inputformat: 'caf',
        outputformat: 'mp3',
        input: 'download',
        file: `https://s3.eu-west-2.amazonaws.com/soundtown.sample/${Contents[0].Key}`,
        output: {
          s3: {
            accesskeyid: AWS_ACCESS_KEY_ID,
            secretaccesskey: AWS_SECRET_ACCESS_KEY,
            bucket: convertedBucket,
            region: 'eu-west-2',
            path: 'converted_recording.mp3',
          },
        },
        wait: true,
        download: false,
      })
        .then(({ data }) => {
          res.send(data);
        })
        .catch(next);
    }
  });
};

module.exports = { processSample };
