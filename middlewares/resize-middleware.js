const sharp = require('sharp');
const multer = require('multer');

const resizeImageMiddleware = async (req, res, next) => {
  //그 이미지를 받아와서?

  try {
    const resizedBuffer = multer({});
    // const  = await sharp(req.file).resize({ width: 500 }).toBuffer();
    req.file.buffer = resizedBuffer;
    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = resizeImageMiddleware;
