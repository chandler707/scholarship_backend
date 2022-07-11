const aws = require('aws-sdk'),
    multer = require('multer'),
    multerS3 = require('multer-s3');

aws.config.update({
    secretAccessKey: '',
    accessKeyId: '',
    region: 'us-west-1'
});

const s3 = new aws.S3();

