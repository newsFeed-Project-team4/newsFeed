const express = require('express');
const router = express.Router();
const { Post } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/posts', authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(412).json({
        errorMessage: '게시글의 정보가 입력되지 않았습니다.',
      });
    }

    const post = await Post.create({
      UserId: userId,
      title,
      content,
    });

    return res.status(201).json({ message: '게시글을 생성하였습니다.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: '게시글 작성에 실패하였습니다.' });
  }
});

module.exports = router;
