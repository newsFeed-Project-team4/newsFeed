require('dotenv').config();
const env = process.env;

const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const path = require('path');
const uuid4 = require('uuid4');

const s3 = new AWS.S3({
  accessKeyId: env.S3_ACCESS_KEY,
  secretAccessKey: env.S3_ACCESS_KEY_SECRET,
  region: env.AWS_REGION,
});

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif'];

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, callback) {
      const fileId = uuid4();
      const type = file.mimetype.split('/')[1];
      if (
        !allowedExtensions.includes(path.extname(file.originalname.toLowerCase())) ||
        !file.mimetype.startsWith('image/')
      )
        return callback('이미지 파일만 업로드가 가능합니다.');

      const fileName = `${fileId}.${type}`;
      callback(null, fileName);
    },
    acl: 'public-read-write',
  }),
  limits: { fieldSize: 1024 * 1024 },
});
console.log(upload);
const uploadMiddleware = upload.single('newFile');
module.exports = uploadMiddleware;
