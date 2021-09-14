const { User } = require('../../models');
const { 
  checkRefeshToken, 
  generateAccessToken, 
  resendAccessToken 
} = require('../tokenFunctions');

module.exports = (req, res) => {
  // 요청에 리프레시 토큰이 쿠키로 존재하는지 확인한다.
  const refreshToken = req.cookies.refreshToken;
  if( !refreshToken ) return res.status(403).json({ data: null, message: 'refresh token not provided' });

  // 리프레시 토큰이 있다면 유효한지 검사한다.
  const refreshTokenData = checkRefeshToken(refreshToken);
  if( !refreshTokenData ) return res.status(401).json({ data: null, message: 'invalid refresh token, please log in again' });

  // 리프레시 토큰 검사를 통해 디코드된 정보로 유저를 조회한다.
  const { userId } = refreshTokenData;
  User
    .findOne({ where: { userId }})
    .then((data) => {
      // 해당하는 유저가 존재하지 않는다.
      if( !data ) return res.status(204).json({ data: null, message: 'refresh token has been tempered' });
      delete data.dataValues.password;
      const newAccessToken = generateAccessToken(data.dataValues);
      resendAccessToken(res, newAccessToken, data.dataValues);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500) // Server error
    });
};
