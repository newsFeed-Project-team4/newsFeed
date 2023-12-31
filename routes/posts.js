const express = require('express');
const { Post, Like } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const uploadMiddleware = require('../middlewares/upload-middleware.js');

// const AWS = require('aws-sdk');
// const sharp = require('sharp');
// const https = require('https');
// require('dotenv').config();
// const env = process.env;

// const s3 = new AWS.S3({
//   accessKeyId: env.S3_ACCESS_KEY,
//   secretAccessKey: env.S3_ACCESS_KEY_SECRET,
//   region: env.AWS_REGION,
// });

router.post('/posts', authMiddleware, uploadMiddleware, async (req, res) => {
  let filepath = req.file ? req.file.location : null;
  // console.log(req.file.location);
  //여기에 프로미스 함수를
  if (filepath) {
    filepath = filepath.replace('assume-bucket', 'assume-bucket-resized');
  }
  try {
    const { User_id } = res.locals.user;
    const name = res.locals.userName;
    const { title, content } = req.body;

    if (!title || !content)
      return res.status(400).json({
        errorMessage: '게시글의 정보가 입력되지 않았습니다.',
      });

    // 방법 2)
    // if (filepath) {
    //   const imageUrl = req.file.location;

    // 이미지를 다운로드합니다.
    //   const downloadImage = () =>
    //     new Promise((resolve, reject) => {
    //       https.get(imageUrl, (response) => {
    //         if (response.statusCode !== 200) {
    //           reject(new Error('이미지를 다운로드할 수 없습니다.'));
    //         }
    //         const chunks = [];
    //         response.on('data', (chunk) => chunks.push(chunk));
    //         response.on('end', () => resolve(Buffer.concat(chunks)));
    //       });
    //     });
    //   // 이미지를 다운로드하고 리사이징합니다.
    //   const imageBuffer = await downloadImage();
    //   const resizedImageBuffer = await sharp(imageBuffer)
    //     .resize({ width: 500 }) // 리사이징할 크기를 지정합니다.
    //     .toBuffer();

    //   const uploadParams = {
    //     Bucket: env.BUCKET_NAME,
    //     Key: `resized/${req.file.key}`,
    //     Body: resizedImageBuffer,
    //     ContentType: req.file.contentType,
    //     ACL: 'public-read',
    //   };

    //   const uploadResult = await s3.upload(uploadParams).promise();
    //   filepath = uploadResult.Location;

    //   const deleteParams = {
    //     Bucket: env.BUCKET_NAME,
    //     Key: req.file.key,
    //   };

    //   await s3.deleteObject(deleteParams).promise();
    // }

    const imageTag = filepath
      ? `<img src="${filepath}" class="postImage" alt="../assets/image/defaultImage.jpg" />`
      : '';

    const post = await Post.create({
      User_id,
      title,
      content,
      Name: name,
      image_url: imageTag,
    });

    return res.status(201).json({ message: '게시글을 생성하였습니다.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '게시글 작성에 실패하였습니다.' });
  }
});

// 게시글 전체 조회
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.findAll({
      attributes: ['post_id', 'User_id', 'title', 'Name', 'content', 'image_url', 'created_at'],
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Like,
          attributes: ['User_id', 'Post_id'],
          groupBy: ['Post_id'],
        },
      ],
    });

    if (!posts.length) {
      return res.status(404).json({ errorMessage: '작성된 게시글이 없습니다.' });
    }

    return res.status(200).json({ posts: posts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '게시글 조회에 실패했습니다.' });
  }
});

// 게시글 상세 조회
router.get('/posts/:post_id', async (req, res) => {
  try {
    const { post_id } = req.params;
    const post = await Post.findOne({
      attributes: ['post_id', 'User_id', 'image_url', 'title', 'Name', 'content', 'created_at'],
      where: { post_id },
      //상세페이지에서도 좋아요표시가 되야하기때문에 수정
      include: [
        {
          model: Like,
          attributes: ['User_id', 'Post_id'],
          groupBy: ['Post_id'],
        },
      ],
    });
    if (!post) {
      return res.status(404).json({ errorMessage: '해당 게시글을 찾을 수 없습니다.' });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '게시글 조회에 실패했습니다.' });
  }
});

// 게시글 검색 기능
router.post('/lookup', async (req, res) => {
  try {
    const { searchInput, category } = req.body;

    if (!searchInput) {
      return res.status(400).json({
        errorMessage: '검색어를 입력해주세요.',
      });
    }

    switch (category) {
      case 'searchNone':
        return res.status(400).json({ errorMessage: '검색 범위를 선택해주세요.' });
      case 'searchTitle': {
        const searchPosts = await Post.findAll({
          attributes: ['post_id', 'User_id', 'title', 'Name', 'image_url', 'created_at'],
          where: { title: { [Op.like]: `%${searchInput}%` } },
          order: [['created_at', 'DESC']],
          include: [
            {
              model: Like,
              attributes: ['User_id', 'Post_id'],
              groupBy: ['Post_id'],
            },
          ],
        });

        return res.status(200).json({ searchPosts });
      }
      case 'searchContent': {
        const searchPosts = await Post.findAll({
          attributes: ['post_id', 'User_id', 'title', 'Name', 'image_url', 'created_at'],
          where: {
            [Op.or]: [
              { title: { [Op.like]: `%${searchInput}%` } },
              { content: { [Op.like]: `%${searchInput}%` } },
            ],
          },
          order: [['created_at', 'DESC']],
          include: [
            {
              model: Like,
              attributes: ['User_id', 'Post_id'],
              groupBy: ['Post_id'],
            },
          ],
        });

        return res.status(200).json({ searchPosts });
      }
      case 'searchAll': {
        const searchPosts = await Post.findAll({
          attributes: ['post_id', 'User_id', 'title', 'Name', 'image_url', 'created_at'],
          where: {
            [Op.or]: [
              { title: { [Op.like]: `%${searchInput}%` } },
              { content: { [Op.like]: `%${searchInput}%` } },
              { Name: { [Op.like]: `%${searchInput}%` } },
            ],
          },
          order: [['created_at', 'DESC']],
          include: [
            {
              model: Like,
              attributes: ['User_id', 'Post_id'],
              groupBy: ['Post_id'],
            },
          ],
        });

        return res.status(200).json({ searchPosts });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errorMessage: '게시글 검색에 실패하였습니다.',
    });
  }
});

// 게시글 수정
router.put('/posts/:post_id', authMiddleware, uploadMiddleware, async (req, res) => {
  let filepath = req.file ? req.file.location : null;

  const { post_id } = req.params;
  const { User_id } = res.locals.user;
  const { title, content } = req.body;

  try {
    // 게시글을 조회합니다.
    const post = await Post.findByPk(post_id);

    if (!post) {
      return res.status(404).json({ errorMessage: '해당 게시글을 찾을 수 없습니다.' });
    } else if (post.User_id !== User_id) {
      return res.status(401).json({ errorMessage: '게시글 수정 권한이 존재하지 않습니다.' });
    }

    // title이나 content 형식이 비정상적인 경우
    if (!title || !content) {
      return res
        .status(400)
        .json({ errorMessage: '게시글 제목이나 내용이 빈 내용인지 확인해 주세요.' });
    }

    if (filepath) {
      const imageTag = `<img src="${filepath}" class="postImage" alt="../image/defaultImage.jpg" />`;
      await Post.update(
        { image_url: imageTag, title, content },
        {
          where: {
            post_id,
            User_id: User_id,
          },
        },
      );
      return res.status(200).json({ message: '수정이 완료되었습니다.' });
    } else {
      // 게시글의 권한을 확인하고, 게시글을 수정합니다.
      await Post.update(
        { title, content }, // title과 content 컬럼을 수정합니다.
        {
          where: {
            post_id,
            User_id: User_id,
          },
        },
      );

      return res.status(200).json({ message: '수정이 완료되었습니다.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '게시글 수정에 실패했습니다.' });
  }
});

// 게시글 삭제
router.delete('/posts/:post_id', authMiddleware, async (req, res) => {
  try {
    const { post_id } = req.params;
    const { User_id } = res.locals.user;

    // 게시글을 조회합니다.
    const post = await Post.findByPk(post_id);

    if (!post) {
      return res.status(404).json({ errorMessage: '해당 게시글을 찾을 수 없습니다.' });
    } else if (post.User_id !== User_id) {
      return res.status(401).json({ errorMessage: '게시글 삭제 권한이 존재하지 않습니다.' });
    }

    // 게시글을 삭제합니다.
    await Post.destroy({
      where: {
        [Op.and]: [{ post_id }, { User_id: User_id }],
      },
    });

    return res.status(200).json({ message: '게시글이 삭제되었습니다.' }); //204
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '게시글 삭제에 실패했습니다.' });
  }
});

// 좋아요 기능
router.post('/posts/:post_id/like', authMiddleware, async (req, res) => {
  const { post_id } = req.params;
  const { User_id } = res.locals.user; // 현재 로그인한 사용자의 ID

  try {
    const post = await Post.findByPk(post_id);
    if (!post) {
      return res.status(404).json({ errorMessage: '게시글을 찾을 수 없습니다.' });
    }

    const existingLike = await Like.findOne({
      where: {
        [Op.and]: [{ Post_id: post_id }, { User_id }],
      },
    });

    if (existingLike) {
      // 이미 좋아요를 눌렀다면 좋아요 취소
      await existingLike.destroy(); // 좋아요 기록 삭제
      return res.status(200).json({ message: '좋아요를 취소했습니다.' });
    } else {
      // 좋아요 추가
      await Like.create({
        Post_id: post_id,
        User_id,
      }); // 좋아요 기록 생성

      const postLikes = await Like.findAll({ where: { Post_id: post_id } });
      return res
        .status(200)
        .json({ message: '좋아요를 추가했습니다.', postLikes: postLikes.length });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: '좋아요를 처리하는 도중 에러가 발생했습니다.' });
  }
});

module.exports = router;
