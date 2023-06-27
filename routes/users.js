const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const { Op } = require('sequelize');
const { User, UserInfo } = require('../models');
const salt = 12;
//임시 미들웨어
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/signup', async (req, res) => {
  const { email, name, password, confirmPassword, petName, profileUrl } = req.body;
  const emailReg = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w)*(\.\w{2,3})+$/);
  try {
    if (!email || !name || !password || !confirmPassword)
      return res
        .status(412)
        .json({ errorMessage: '이메일, 이름, 비밀번호, 비밀번호 확인을 전부 입력해주세요.' });

    if (!emailReg.test(email))
      return res
        .status(412)
        .json({ errorMessage: '이메일 형식이 올바르지 않습니다. 다시 입력해 주세요.' });

    const emailName = email.split('@')[0];
    if (password.length < 4 || password.includes(emailName))
      return res.status(412).json({
        errorMessage: '패스워드는 4자리이상이고 이메일과 같은 값이 포함이 되면 안됩니다.',
      });

    if (password !== confirmPassword)
      return res.status(412).json({ errorMessage: '패스워드와 패스워드확인이 다릅니다.' });

    const existUser = await User.findOne({ where: { email } });
    if (existUser) return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });

    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ email, password: hashPassword });
    await UserInfo.create({ UserId: user.userId, name, petName, profileUrl });

    return res.status(201).json({ message: '회원 가입에 성공하였습니다.' });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: '요청한 데이터 형식이 올바르지 않습니다.' });
  }
});
// Case 1)
// bcrypt.compare(ComparePW, hash, (err, result) => {
//     result
//   });
// Case 2)
// const match = await bcrypt.compare(ComparePW, hash);

//회원 정보 수정 API
router.put('/login/:userId', authMiddleware, async (req, res) => {
  try {
    const {
      email,
      name,
      beforePassword,
      afterPassword,
      confirmPassword,
      petName,
      oneLiner,
      imageUrl,
    } = req.body;
    const { userId } = req.params;
    const user = await User.findOne({ where: { userId } });
    const userInfo = await UserInfo.findOne({ where: { userId } });
    const match = await bcrypt.compare(beforePassword, user.password);

    //이메일 과 같은 값이 들어가면 안됨
    const emailSplit = email.split('@');
    const pwdCheckEmail = beforePassword.search(emailSplit[0]);

    if (!match) {
      //저장된 비밀번호와 입력한 비밀번호가 같지않을때
      return res.status(412).json({ errorMessage: '패스워드가 일치하지않습니다.' });
    } else if (!email || !name) {
      //이메일 또는 이름을 입력하지 않았을때
      return res.status(412).json({ errorMessage: '이메일, 이름을 입력해주세요.' });
    } else if (beforePassword.length < 4 || pwdCheckEmail > -1) {
      //입려한 비밀번호가 4자리 미만이거나 비밀번호에 이메일 주소 @앞과 같은 값이 있을때
      return res.status(412).json({
        errorMessage: '패스워드는 4자리 이상이고 이메일과 같은 값이 포함이 되면 안됩니다.',
      });
    } else if (afterPassword != confirmPassword) {
      //바꿀 비밀번호와 그 비밀번호를 확인하는 값이 다를때
      return res
        .status(412)
        .json({ errorMessage: '변경된 비밀번호와 비밀번호 확인이 일치하지 않습니다.' });
    }

    if (!afterPassword && !confirmPassword) {
      //두 값다 없을때 비밀번호는 변경하지 않는다
      await user.update(
        { email, password: beforePassword },
        {
          where: {
            [Op.and]: [{ userId }],
          },
        },
      );
    } else {
      //그렇지 않다면 비밀번호 변경이니 변경된 비밀번호로 수정
      const hashPassword = await bcrypt.hash(afterPassword, salt);

      await user.update(
        { email, password: hashPassword },
        {
          where: {
            [Op.and]: [{ userId }],
          },
        },
      );
    }

    //꼭 값을 넣을 필요 없는 한마디, 펫이름, 프로필 이미지가 값이 없을 경우 대체
    if (!oneLiner) oneLiner = '한 마디는 없습니다.';
    if (!petName) petName = '반려동물은 없습니다.';
    if (!imageUrl) imageUrl = '대체 사진 url';
    await userInfo.update(
      { name, oneLiner, imageUrl, petName },
      {
        where: {
          [Op.and]: [{ userId }],
        },
      },
    );
    return res.status(200).json({ message: '회원 정보가 수정되었습니다.' });
  } catch (error) {
    return res.status(400).json({ errorMessage: '회원정보 수정에 실패했습니다.' });
  }
});

//로그아웃 API
router.delete('/login/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    await User.findOne({ where: { userId } });

    //현재 쿠키를 지움으로써 로그아웃, 쿠키이름은 지정되면 변경
    res.clearCookie('cookie 이름');
    res.redirect('/');
  } catch (error) {
    return res.status(400).json({ errorMessage: '로그아웃에 실패했습니다.' });
  }
});
module.exports = router;
