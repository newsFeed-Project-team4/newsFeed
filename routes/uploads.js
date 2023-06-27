const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middlewares/uploadMiddleware.js');

router.post('/upload', uploadMiddleware, (req, res) => {
  console.log(req.file);
  return res.status(200).send('uploaded');
});

module.exports = router;
