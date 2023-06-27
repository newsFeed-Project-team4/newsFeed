const jwt = require('jsonwebtoken');
const { UserInfo, Token } = require('../models');

module.exports = async (req, res, next) => {
  //   const existRefreshToken = await Token.findOne({});
  const { accessToken } = req.cookies;
  const [accessTokenType, accessAuthToken] = (accessToken ?? '').split(' ');
  try {
    if (accessTokenType !== 'Bearer' && !accessAuthToken)
      return res.status(403).json({ errorMessage: '로그인 후에 이용할 수 있는 기능입니다.' });
    const decodedToken = jwt.verify(accessAuthToken, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;

    const user = await UserInfo.findOne({ where: { UserId: userId } });
    if (!user)
      return res.status(401).json({ errorMessage: '토큰에 해당하는 사용자가 존재하지 않습니다.' });

    res.locals.user = user;
    res.locals.Nickname = user.name;

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(403)
      .json({ errorMessage: '토큰이 만료된 아이디입니다. 다시 로그인 해주세요.' });
  }
};
