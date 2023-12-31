const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { User, UserInfo, Token } = require('../models');
const Axios = require('axios');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const authMiddleware = require('../middlewares/auth-middleware.js');
const uploadMiddleware = require('../middlewares/upload-middleware.js');
const salt = 12;
require('dotenv').config;
const env = process.env;

router.post('/signup', uploadMiddleware, async (req, res) => {
  let filepath = req.file ? req.file.location : null;
  const { email, name, password, confirmPassword, pet_name } = req.body;
  const emailReg = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w)*(\.\w{2,3})+$/);

  if (filepath) {
    filepath = filepath.replace('assume-bucket', 'assume-bucket-resized');
  }
  try {
    if (!email || !name || !password || !confirmPassword)
      return res
        .status(400)
        .json({ errorMessage: '이메일, 이름, 비밀번호, 비밀번호 확인을 전부 입력해주세요.' });

    if (!emailReg.test(email))
      return res
        .status(400)
        .json({ errorMessage: '이메일 형식이 올바르지 않습니다. 다시 입력해 주세요.' });

    const emailName = email.split('@')[0];
    if (password.length < 4 || emailName.includes(password))
      return res.status(400).json({
        errorMessage: '패스워드는 4자리이상이고 이메일과 같은 값이 포함이 되면 안됩니다.',
      });

    if (password !== confirmPassword)
      return res.status(412).json({ errorMessage: '패스워드와 패스워드확인이 다릅니다.' });

    const existUser = await User.findOne({ where: { email } });
    if (existUser) return res.status(409).json({ errorMessage: '이미 존재하는 이메일입니다.' });

    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ email, password: hashPassword });
    await UserInfo.create({ User_id: user.user_id, name, pet_name, image_url: filepath });

    return res.status(201).json({ message: '회원 가입에 성공하였습니다.' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: '요청한 데이터 형식이 올바르지 않습니다.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ errorMessage: '이메일 또는 패스워드를 입력해주세요.' });
  }
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res
      .status(412)
      .json({ errorMessage: '회원가입되지 않은 이메일이거나 비밀번호가 다릅니다.' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res
      .status(412)
      .json({ errorMessage: '회원가입되지 않은 이메일이거나 비밀번호가 다릅니다.' });
  }
  const userInfo = await UserInfo.findOne({ where: { User_id: user.user_id } });
  // 저장된 user의 refreshToken이 있는지 확인
  const existReFreshToken = await Token.findOne({ where: { User_id: user.user_id } });

  // 없으면 accessToken과 refreshToken을 모두 생성
  if (!existReFreshToken) {
    const refreshToken = jwt.sign({}, process.env.JWT_SECRET_KEY, { expiresIn: '14d' });
    const accessToken = jwt.sign({ User_id: user.user_id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });

    await Token.create({ token_id: refreshToken, User_id: user.user_id });

    res.clearCookie('accessToken');
    res.cookie('accessToken', `Bearer ${accessToken}`);
    return res.status(200).json({ message: `${userInfo.name}님 환영합니다.`, userInfo });
  }

  try {
    // refreshToken이 있다면 검증을 실시
    // 검증이 성공이 된다면 accessToken만 새로 발급하고 refreshToken은 그대로 가져옴
    // 이 때, 기존에 있는 값을 지우고 새로 생성하는 이유는 Token에 여러 계정이 들어가기 때문에
    // 계정이 의도치않게 삭제되거나 로그아웃 되었을 때 가장 마지막에 로그인한 사용자의 정보가
    // 자동으로 로그인 되도록 설정하기 위해서 기존에 Token에 있는 값을 지우고 새로 생성
    // refreshToken은 그대로 가져오기에 만료기간은 갱신되지 않음
    jwt.verify(existReFreshToken.token_id, process.env.JWT_SECRET_KEY);

    await Token.destroy({ where: { User_id: user.user_id } });
    await Token.create({ token_id: existReFreshToken.token_id, User_id: user.user_id });

    const accessToken = jwt.sign({ User_id: user.user_id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });

    res.clearCookie('accessToken');
    res.cookie('accessToken', `Bearer ${accessToken}`);
    return res.status(200).json({ message: `${userInfo.name}님 환영합니다.`, userInfo });
  } catch (error) {
    // refreshToken이 만료되었을 경우
    // 두 토큰을 전부 생성
    if (error.name === 'TokenExpiredError') {
      const refreshToken = jwt.sign({}, process.env.JWT_SECRET_KEY, { expiresIn: '14d' });
      const accessToken = jwt.sign({ User_id: user.user_id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1h',
      });

      await Token.destroy({ where: { User_id: user.user_id } });
      await Token.create({ token_id: refreshToken, User_id: user.user_id });

      res.clearCookie('accessToken');
      res.cookie('accessToken', `Bearer ${accessToken}`);
      return res.status(200).json({ message: `${userInfo.name}님 환영합니다.`, userInfo });
    }
    console.log(error);
    return res.status(500).json({ errorMessage: '로그인에 실패하였습니다.' });
  }
});

router.get('/socialLogin/kakao', async (req, res) => {
  const code = req.query.code;

  const authToken = await Axios.post(
    'https://kauth.kakao.com/oauth/token',
    {},
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: {
        grant_type: 'authorization_code',
        client_id: env.KAKAO_RESTAPI_KEY,
        code,
        redirect_uri: 'http://127.0.0.1:3018/socialLogin/kakao',
      },
    },
  );

  const authInfo = await Axios.post(
    'https://kapi.kakao.com/v2/user/me',
    {},
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + authToken.data.access_token,
      },
    },
  );

  console.log(authInfo.data.kakao_account);

  return res.status(200).json({ message: '인증완료' });
});

//회원 정보 수정 API
//유저의 id를 받아서 해당 유저의 정보를 수정하게끔 (비밀번호를 입력받아서 일치하면)
router.put('/login/:user_id', uploadMiddleware, authMiddleware, async (req, res) => {
  const filepath = req.file ? req.file.location : null;

  const { user_id } = req.params;
  const {
    name,
    beforePassword, //현재 비밀번호
    afterPassword, //바꿀 비밀번호
    confirmPassword, //비밀번호 확인
    pet_name,
    one_line_introduction,
  } = req.body;

  try {
    const user = await User.findOne({ where: { user_id } });
    if (!user)
      return res.status(401).json({
        errorMessage: '로그인 후에 이용할 수 있는 기능입니다.',
      });

    const existToken = await Token.findOne({ where: { User_id: user.user_id } });
    if (!existToken) {
      return res.status(401).json({
        errorMessage: '로그인 후에 이용할 수 있는 기능입니다.',
      });
    }

    //얘는 프론트에서 input을 줬을 때만 실행이 되게끔 설정이 가능해서 뺄 가능성 있음.
    // if (!password)
    //   return res.status(400).json({
    //     errorMessage: `비밀번호가 입력이 되지 않았습니다.`,
    //   });

    // const existChangePermission = await bcrypt.compare(password, user.password);
    // if (!existChangePermission)
    //   return res.status(400).json({
    //     errorMessage: `수정하려는 계정의 비밀번호와 일치하지 않아 수정할 수 없습니다.`,
    //   });

    // 프론트에서 비밀번호(beforePassword) 받아와서 확인
    if (!beforePassword)
      return res.status(400).json({
        errorMessage: `비밀번호가 입력이 되지 않았습니다.`,
      });

    if (!confirmPassword || !afterPassword)
      if (!name || !beforePassword) {
        //이름 또는 현재 비밀번호를 입력하지 않았을때
        return res.status(400).json({ errorMessage: '이름과 현재 비밀번호를 입력해 주세요.' });
      }

    const userInfo = await UserInfo.findOne({ where: { User_id: user.user_id } });
    const match = await bcrypt.compare(beforePassword, user.password);

    if (!match) {
      //저장된 비밀번호와 입력한 비밀번호가 같지않을때
      return res.status(412).json({
        errorMessage: '현재 비밀번호와 입력한 비밀번호가 일치하지 않습니다.',
      });
    }

    //이메일 과 같은 값이 들어가면 안됨
    const emailSplit = user.email.split('@');

    if ((!afterPassword && confirmPassword) || (afterPassword && !confirmPassword))
      return res.status(400).json({
        errorMessage: '비밀번호를 변경하시려면 변경 비밀번호와 확인을 둘 다 입력해주세요.',
      });

    if (afterPassword) {
      if (afterPassword.length < 4 || emailSplit[0].includes(afterPassword)) {
        //입려한 비밀번호가 4자리 미만이거나 비밀번호에 이메일 주소 @앞과 같은 값이 있을때
        return res.status(400).json({
          errorMessage:
            '변경 할 비밀번호는 4자리 이상이여야 하고 이메일과 같은 값이 포함이 되면 안됩니다.',
        });
      } else if (afterPassword !== confirmPassword) {
        //바꿀 비밀번호와 그 비밀번호를 확인하는 값이 다를때
        return res
          .status(412)
          .json({ errorMessage: '변경할 비밀번호와 비밀번호 확인이 일치하지 않습니다.' });
      } else if (afterPassword === confirmPassword) {
        //비밀번호 변경이니 변경된 비밀번호로 수정
        const hashPassword = await bcrypt.hash(afterPassword, salt);

        await user.update(
          { password: hashPassword },
          {
            where: {
              [Op.and]: [{ user_id }],
            },
          },
        );
      }
    }

    //받아온 파일값이 없을경우 저장된 이미지값 불러옴
    let image = filepath;
    if (!filepath) {
      image = userInfo.image_url;
    }

    //꼭 값을 넣을 필요 없는 한마디, 펫이름, 프로필 이미지가 값이 없을 경우 대체
    // if (!oneLiner) oneLiner = '한 마디는 없습니다.';
    // if (!petName) petName = '반려동물은 없습니다.';
    // if (!imageUrl) imageUrl = '대체 사진 url';
    await userInfo.update(
      { name, one_line_introduction, image_url: image, pet_name },
      {
        where: {
          [Op.and]: [{ User_id: user.user_id }],
        },
      },
    );
    return res.status(200).json({ message: '회원 정보가 수정되었습니다.', userInfo });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: '회원정보 수정에 실패했습니다.' });
  }
});

//권한 확인 API
router.get('/accessRight/:user_id', authMiddleware, async (req, res) => {
  try {
    const currentUser = res.locals.user;
    const { user_id } = req.params;

    if (currentUser.User_id === user_id / 1)
      return res.status(200).json({ message: 'Authorization success' });
    else return res.status(401).json({ errorMessage: 'Authorization failed' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: '권한 확인에 실패하였습니다.' });
  }
});

//현재 로그인 된 사용자 ID 불러오기
router.get('/loginUserInfo', authMiddleware, async (req, res) => {
  try {
    const users = await Token.findOne({
      attributes: ['User_id'],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: '계정 정보 불러오기에 실패하였습니다.' });
  }
});

//로그인 중인 사용자 정보 불러오기
router.get('/loginUserInfo/:user_id', authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;

    const userInfo = await UserInfo.findOne({ where: { user_id } });

    return res.status(200).json({ userInfo });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: '사용자 상세 정보 불러오기에 실패하였습니다.' });
  }
});

//로그인 중인 사용자 목록 불러오기
router.get('/loginUsersInfo', authMiddleware, async (req, res) => {
  try {
    const users = await Token.findAll({
      attributes: ['User_id'],
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['email'],
        },
      ],
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: '계정 정보 불러오기에 실패하였습니다.' });
  }
});

// 사용자 계정 전환 API
router.post('/switchId/:user_id', authMiddleware, async (req, res) => {
  //쿼리는 프론트에서 input창을 받아서 서버로 쏴주는 비밀번호(이 비밀번호가 현재 계정을 인증)
  const { password } = req.body;
  const { user_id } = req.params;

  try {
    const existUser = await User.findOne({ where: { user_id } });
    if (!existUser)
      return res.status(404).json({
        errorMessage: '회원가입이 되어 있지 않은 아이디입니다. 회원가입 해주세요.',
      });

    //뺄 수도 있음
    if (!password)
      return res.status(400).json({
        errorMessage: `비밀번호가 입력이 되지 않았습니다.`,
      });
    const existUserInfo = await UserInfo.findOne({ where: { User_id: existUser.user_id } });

    const existChangePermission = await bcrypt.compare(password, existUser.password);
    if (!existChangePermission)
      return res.status(401).json({
        errorMessage: `${existUserInfo.name}님의 비밀번호와 일치하지 않아 계정 전환을 할 수 없습니다.`,
      });

    // 해당 유저의 refreshToken을 가져와 검증함
    // 검증에 성공하면 해당 유저를 로그인 상태로 바꾸고 refreshToken을 삭제하고 재생성해서 제일 상단에 위치하게 함
    const existReFreshToken = await Token.findOne({ where: { User_id: existUser.user_id } });
    jwt.verify(existReFreshToken.token_id, process.env.JWT_SECRET_KEY);

    await Token.destroy({ where: { User_id: existUser.user_id } });
    await Token.create({ token_id: existReFreshToken.token_id, User_id: existUser.user_id });

    res.clearCookie('accessToken');
    const accessToken = jwt.sign({ User_id: existUser.user_id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });
    res.cookie('accessToken', `Bearer ${accessToken}`);
    return res
      .status(200)
      .json({ message: `${existUserInfo.name}님의 계정으로 전환되었습니다.`, existUserInfo });
  } catch (error) {
    // 토큰이 검증 실패했으면 만료된 아이디라는 오류 반환
    if (error.name === 'TokenExpiredError') {
      res.clearCookie('accessToken');
      await Token.destroy({ where: { User_id: user_id } });
      return res.status(401).json({
        errorMessage: '토큰이 만료된 아이디입니다. 다시 로그인 해주세요.',
      });
    }
    // 토큰이 존재하지 않았을 경우에 여기로 들어가서 로그인 먼저 해달라는 오류 반환
    console.log(error);
    return res.status(500).json({
      errorMessage: '계정 전환에 실패했습니다. 로그인 먼저 해주세요.',
    });
  }
});

//로그아웃 API
router.post('/logout/:user_id', authMiddleware, async (req, res) => {
  const { user_id } = req.params;
  const { password } = req.body;
  const currentUser = res.locals.user;
  const user = await User.findOne({ where: { user_id } });

  try {
    if (!password)
      return res.status(400).json({
        errorMessage: `비밀번호가 입력이 되지 않았습니다.`,
      });

    if (!user)
      return res.status(401).json({
        errorMessage: '로그인이 되어 있지 않은 아이디입니다.',
      });

    const userInfo = await UserInfo.findOne({ where: { User_id: user.user_id } });
    const existToken = await Token.findOne({ where: { User_id: user.user_id } });

    const existChangePermission = await bcrypt.compare(password, user.password);
    if (!existChangePermission)
      return res.status(400).json({
        errorMessage: `${userInfo.name}님의 비밀번호와 일치하지 않아 로그아웃을 할 수 없습니다.`,
      });

    if (!existToken)
      return res.status(401).json({
        errorMessage: '로그인이 되어 있지 않은 아이디입니다.',
      });

    await Token.destroy({ where: { User_id: user_id } });

    if (user_id / 1 === currentUser.User_id) res.clearCookie('accessToken');

    return res.status(200).json({ message: `${userInfo.name}님이 로그아웃 되었습니다.`, userInfo });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: '로그아웃에 실패했습니다.' });
  }
});

module.exports = router;
