const express = require('express');
const { Op } = require('sequelize');
const { User, Comment, Post, UserInfo, Token } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();

//댓글 작성 API
router.post('/posts/:post_id/comments', authMiddleware, async (req, res) => {
  const { post_id } = req.params;
  const { comment } = req.body;
  const { User_id } = res.locals.user;
  try {
    const post = await Post.findOne({ where: { post_id } });
    const user = await UserInfo.findOne({ where: { User_id } });
    const existToken = await Token.findOne({ where: { User_id: user.User_id } });

    if (!existToken) {
      return res.status(401).json({
        errorMessage: '로그인이 되어 있지 않은 아이디입니다.',
      });
    }

    if (!post) {
      return res.status(404).json({ errorMessage: '게시글이 없습니다.' });
    } else if (!comment) {
      return res.status(400).json({ errorMessage: '댓글 정보가 입력되지 않았습니다.' });
    }

    await Comment.create({
      Post_id: post_id,
      User_id,
      name: user.name,
      comment,
    });
    res.status(201).json({ message: '댓글을 생성하였습니다.' });
  } catch (error) {
    return res.status(500).json({ errorMessage: '댓글 작성에 실패했습니다.' });
  }
});

//댓글 조회 API
router.get('/posts/:post_id/comments', async (req, res) => {
  const { post_id } = req.params;

  try {
    const post = await Post.findOne({ where: { post_id } });

    if (!post) {
      return res.status(404).json({ errorMessage: '게시글이 없습니다.' });
    }
    const comments = await Comment.findAll({
      attributes: ['Post_id', 'User_id', 'name', 'comment', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']],
      where: { Post_id: post_id },
    });

    res.status(200).json({ comments: comments });
  } catch (error) {
    return res.status(500).json({ errorMessage: '댓글 조회에 실패했습니다.' });
  }
});

//댓글 수정 API
router.put('/posts/:post_id/comments/:comment_id', authMiddleware, async (req, res) => {
  const { post_id, comment_id } = req.params;
  const { comment } = req.body;
  const { User_id } = res.locals.user;

  try {
    const post = await Post.findOne({ where: { post_id } });
    const findComment = await Comment.findOne({ where: { comment_id } });
    const user = await User.findOne({ where: { user_id: User_id } });
    const existToken = await Token.findOne({ where: { User_id: user.user_id } });

    if (!existToken) {
      return res.status(401).json({
        errorMessage: '로그인이 되어 있지 않은 아이디입니다.',
      });
    }
    if (!post) {
      return res.status(404).json({ errorMessage: '해당 게시글을 찾을 수 없습니다.' });
    } else if (!findComment) {
      return res.status(404).json({ errorMessage: '해당 댓글을 찾을 수 없습니다.' });
    } else if (!comment) {
      return res.status(400).json({ errorMessage: '댓글이 빈 내용인지 확인해주세요.' });
    } else if (User_id !== findComment.User_id) {
      return res.status(401).json({ errorMessage: '댓글 수정 권한이 존재하지 않습니다.' });
    }

    await Comment.update(
      { comment },
      {
        where: {
          [Op.and]: [{ comment_id }, { Post_id: post_id }, { User_id }],
        },
      },
    );
    res.status(200).json({ message: '댓글을 수정하였습니다.' });
  } catch (error) {
    return res.status(500).json({ errorMessage: '댓글 수정에 실패했습니다.' });
  }
});

//댓글 삭제 API
router.delete('/posts/:post_id/comments/:comment_id', authMiddleware, async (req, res) => {
  const { post_id, comment_id } = req.params;
  const { User_id } = res.locals.user;

  try {
    const post = await Post.findOne({ where: { post_id } });
    const findComment = await Comment.findOne({ where: { comment_id } });

    const user = await User.findOne({ where: { user_id: User_id } });
    const existToken = await Token.findOne({ where: { User_id: user.user_id } });

    if (!existToken) {
      return res.status(401).json({
        errorMessage: '로그인이 되어 있지 않은 아이디입니다.',
      });
    }

    if (!post) {
      return res.status(404).json({ errorMessage: '해당 게시글을 찾을 수 없습니다.' });
    } else if (!findComment) {
      return res.status(404).json({ errorMessage: '해당 댓글을 찾을 수 없습니다.' });
    } else if (User_id !== findComment.User_id) {
      return res.status(401).json({ errorMessage: '댓글 삭제 권한이 존재하지 않습니다.' });
    }

    await Comment.destroy({
      where: { [Op.and]: [{ comment_id }, { User_id }, { Post_id: post_id }] },
    });

    res.status(204).json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    return res.status(500).json({ errorMessage: '댓글 삭제에 실패했습니다.' });
  }
});

module.exports = router;
