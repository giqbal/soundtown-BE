const axios = require('axios');
const { CLOUDCONVERT_API_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env.NODE_ENV ? process.env : require('../config');

const convertToMp3 = (file, convertedBucket, convertedFileName) => axios.post('https://api.cloudconvert.com/convert', {
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
});

module.exports = { convertToMp3 };
