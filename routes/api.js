const apiRouter = require('express').Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const sampleRouter = require('./sample');
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env.NODE_ENV ? process.env : require('../config');

const s3 = new aws.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});
const sampleBucket = 'soundtown.sample';

const upload = multer({
  storage: multerS3({
    s3,
    bucket: sampleBucket,
    acl: 'public-read',
    key: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

apiRouter.use('/sample', upload.single('file'), sampleRouter);

module.exports = apiRouter;
