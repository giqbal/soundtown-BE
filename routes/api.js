const apiRouter = require('express').Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const sampleRouter = require('./sample');

const s3 = new AWS.S3();
const sampleBucket = 'soundtown.sample';

const upload = multer({
  storage: multerS3({
    s3,
    bucket: sampleBucket,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});


apiRouter.use('/sample', upload.single('file'), sampleRouter);

module.exports = apiRouter;
