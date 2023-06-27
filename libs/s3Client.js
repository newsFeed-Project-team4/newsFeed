const S3Client = require('aws-sdk/clients/s3');
const Region = 'ap-northeast-2';
const s3Client = new S3Client({ region: Region });

module.exports = s3Client;
