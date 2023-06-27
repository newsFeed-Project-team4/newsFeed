const express = require('express');
const { Post } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();

router.post('/posts', authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
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
    res.status(500).json({ errorMessage: '게시글 작성에 실패하였습니다.' });
  }
});

// 게시글 전체 조회
router.get('/posts', async (req, res) => {
  const posts = await Post.findAll({
    attributes: ['postId', 'title', 'like', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({ data: posts });
});

// 게시글 상세 조회
router.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findOne({
    attributes: ['postId', 'Name', 'title', 'like', 'content', 'createdAt', 'updatedAt'],
    where: { postId },
  });

  return res.status(200).json({ data: post });
});

// 게시글 수정
router.put('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  // 게시글을 조회합니다.
  const post = await Post.findByPk(postId);

  if (!post) {
    return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
  } else if (post.UserId !== userId) {
    return res.status(401).json({ message: '권한이 없습니다.' });
  }

  // 게시글의 권한을 확인하고, 게시글을 수정합니다.
  await Post.update(
    { title, content }, // title과 content 컬럼을 수정합니다.
    {
      where: {
        postId,
        UserId: userId,
      },
    },
  );

  // 수정된 게시글을 조회합니다.
  const updatedPost = await Post.findByPk(postId);

  return res.status(200).json({ message: '수정이 완료되었습니다.', data: updatedPost });
});

// 게시글 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;

  // 게시글을 조회합니다.
  const post = await Post.findByPk(postId);

  if (!post) {
    return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
  } else if (post.UserId !== userId) {
    return res.status(401).json({ message: '권한이 없습니다.' });
  }

  // 게시글을 삭제합니다.
  await Post.destroy({
    where: {
      postId,
      UserId: userId,
    },
  });

  return res.status(200).json({ data: '게시글이 삭제되었습니다.' });
});

module.exports = router;
