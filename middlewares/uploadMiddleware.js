const multer = require('multer');
const path = require('path');
const uuid4 = require('uuid4');

// const publicPath = path.join(__dirname, 'assets');

const upload = multer({
  storage: multer.diskStorage({
    // filename(req, file, done) {
    //   console.log(file);
    //   done(null, file.originalname);
    // },
    filename(_, file, done) {
      // if (file.originalname === '_.png') {

      //   return;
      // }
      const randomId = uuid4();
      const ext = path.extname(file.originalname);
      const filename = randomId + ext;
      done(null, filename);
    },
    destination(_, file, done) {
      console.log(file);
      done(null, './assets/image');
    },
  }),
  limits: { fileSize: 1024 * 1024 },
});

const uploadMiddleware = upload.single('myFile');

module.exports = uploadMiddleware;
