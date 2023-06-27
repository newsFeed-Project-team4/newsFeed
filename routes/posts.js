const express = require('express');
const { Op } = require('sequelize');
const { Post } = require('../models');
const authMiddleware = require('../middleware/auth-middleware');
const router = express.Router();

router.post('/posts', authMiddleware, async (req, res) => {
  try {
    const { UserId } = res.locals.user;
    const name = res.locals.Nickname
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
      errorMessage: '게시글의 정보가 입력되지 않았습니다.',
    });
    }
    const post = await Post.create({
      UserId: UserId,
      Name: name,
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
  try {
    const posts = await Post.findAll({
      attributes: ['postId', 'title', 'like', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    if (!posts.length) {
      return res.status(404).json({ errorMessage: '작성된 게시글이 없습니다.' });
    }

    return res.status(200).json({ data: posts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '게시글 조회에 실패했습니다.' });
  }
});

// 게시글 상세 조회
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findOne({
      attributes: ['postId', 'Name', 'title', 'like', 'content', 'createdAt', 'updatedAt'],
      where: { postId },
    });

    if (!post) {
      return res.status(404).json({ errorMessage: '해당 게시글을 찾을 수 없습니다.' });
    }

    return res.status(200).json({ data: post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '게시글 조회에 실패했습니다.' });
  }
});

// 게시글 수정
router.put('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    // 게시글을 조회합니다.
    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ errorMessage: '해당 게시글을 찾을 수 없습니다.' });
    } else if (post.UserId !== userId) {
      return res.status(401).json({ errorMessage: '게시글 수정 권한이 존재하지 않습니다.' });
    }

    // title이나 content 형식이 비정상적인 경우
    if (!title || !content) {
      return res
        .status(400)
        .json({ errorMessage: '게시글 제목이나 내용이 빈 내용인지 확인해 주세요.' });
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '게시글 수정에 실패했습니다.' });
  }
});

// 게시글 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    // 게시글을 조회합니다.
    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ errorMessage: '해당 게시글을 찾을 수 없습니다.' });
    } else if (post.UserId !== userId) {
      return res.status(401).json({ errorMessage: '게시글 삭제 권한이 존재하지 않습니다.' });
    }

    // 게시글을 삭제합니다.
    await Post.destroy({
      where: {
        postId,
        UserId: userId,
      },
    });

    return res.status(200).json({ data: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '게시글 삭제에 실패했습니다.' });
  }
});

// 게시글 검색 기능
router.get('/posts/search', async (req, res) => {
  const { query, searchType } = req.query;
  let whereCondition = {};

  if (searchType === 'title') {
    whereCondition = { title: { [Op.like]: `%${query}%` } };
  } else if (searchType === 'content') {
    whereCondition = { content: { [Op.like]: `%${query}%` } };
  } else if (searchType === 'both') {
    whereCondition = {
      [Op.or]: [{ title: { [Op.like]: `%${query}%` } }, { content: { [Op.like]: `%${query}%` } }],
    };
  } else {
    return res.status(400).json({ errorMessage: '정확히 검색해주세요.' });
  }

  const posts = await Post.findAll({
    attributes: ['postId', 'title', 'like', 'createdAt'],
    where: whereCondition,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({ data: posts });
});

module.exports = router;
