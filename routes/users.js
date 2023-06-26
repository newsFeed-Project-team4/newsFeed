const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { User, UserInfo } = require('../models');
const salt = 12;

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
module.exports = router;
