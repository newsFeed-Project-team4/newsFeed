const jwt = require('jsonwebtoken');
const { UserInfo, Token } = require('../models');

module.exports = async (req, res, next) => {
  const existReFreshToken = await Token.findOne({ order: [['created_at', 'DESC']] });
  const { accessToken } = req.cookies;
  const [accessAuthType, accessAuthToken] = (accessToken ?? '').split(' ');

  try {
    // case 1) accessToken과 refreshToken이 둘다 없을때
    // 토큰이 없는 경우니까 로그인 후 이용하도록 설정
    if (accessAuthType !== 'Bearer' && !accessAuthToken && !existReFreshToken) {
      res.status(403).json({
        errorMessage: '로그인 후에 이용할 수 있는 기능입니다.',
      });
      return;
    }
    console.log('여기 상황아님?');
    // case 2) refreshToken들만 있을 때(accessToken만료가 아닌 쿠키 삭제로 인해 없는 경우)
    // refreshToken을 검증 해서 검증이 되면 새 accessToken을 발급해서 쿠키에 저장
    if (existReFreshToken && !accessAuthType && !accessAuthToken) {
      console.log('여기 상황아님?');
      jwt.verify(existReFreshToken.token_id, process.env.JWT_SECRET_KEY);
      const accessToken = jwt.sign(
        { User_id: existReFreshToken.User_id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: '1h',
        },
      );

      res.cookie('accessToken', `Bearer ${accessToken}`);
      const user = await UserInfo.findOne({ where: { User_id: existReFreshToken.User_id } });

      if (!user) {
        res.clearCookie('accessToken');
        return res.status(403).json({ errorMessage: '토큰 사용자가 존재하지 않습니다.' });
      }

      res.locals.user = user;
      res.locals.userName = user.name;
      next();
    } else {
      try {
        // case 3) accessToken과 refreshToken이 둘다 있는 경우
        // accessToken을 검증해 만료되지 않았으면 그대로 사용(refreshToken은 결국 accessToken이 만료 되었을 때만 사용하므로)
        const { User_id } = jwt.verify(accessAuthToken, process.env.JWT_SECRET_KEY);
        const user = await UserInfo.findOne({ where: { User_id } });

        if (!user) {
          res.clearCookie('accessToken');
          return res.status(403).json({ errorMessage: '토큰 사용자가 존재하지 않습니다.' });
        }
        res.locals.user = user;
        res.locals.userName = user.name;

        next();
      } catch (error) {
        // case 4) 토큰이 둘 다 있는데 accessToken만 만료된 경우
        // 이 때, refreshToken을 검증해 만료가 되지 않았다면 새 accessToken을 발급하고 만료 되었다면
        // 만료된 refresh토큰을 삭제하고 다시 로그인 하도록 설정함.
        if (error.name === 'TokenExpiredError') {
          jwt.verify(existReFreshToken.token_id, process.env.JWT_SECRET_KEY);

          const accessToken = jwt.sign(
            { User_id: existReFreshToken.User_id },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: '1h',
            },
          );
          res.cookie('accessToken', `Bearer ${accessToken}`);
          const user = await UserInfo.findOne({ where: { User_id: existReFreshToken.User_id } });

          if (!user) {
            res.clearCookie('accessToken');
            res.status(403).json({ errorMessage: '토큰 사용자가 존재하지 않습니다.' });
          }

          res.locals.user = user;
          res.locals.userName = user.name;
          next();
        }
      }
    }
  } catch (error) {
    // accessToken과 refreshToken 모두 만료된 경우
    // 여러 계정을 저장하기 때문에 가장 최근에 로그인 한 순서대로 비교를 해 만료되지 않은 사용자에게
    // 등록/수정/삭제 권한을 주기 위해서 refreshToken이 만료된 유저는 토큰이 삭제가 되도록 구현
    if (error.name === 'TokenExpiredError') {
      if (existReFreshToken)
        await Token.destroy({ where: { token_id: existReFreshToken.token_id } });

      res.status(403).json({
        errorMessage: '토큰이 만료된 아이디입니다. 다시 로그인 해주세요.',
      });
      return;
    } else {
      console.log(error);
      // 그 밖의 알수 없는 오류가 발생했을 때는 전부 삭제가 되도록 함
      res.clearCookie('accessToken');
      Token.destroy({ where: {} });
      res.status(403).json({
        errorMessage: '전달된 쿠키에서 오류가 발생하였습니다. 모든 쿠키를 삭제합니다.',
      });
      return;
    }
  }
};
