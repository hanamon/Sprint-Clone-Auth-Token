const { User } = require('../../models');
const { 
  generateAccessToken,
  generateRefreshToken,
  sendRefreshToken,
  sendAccessToken
} = require('../tokenFunctions');

module.exports = (req, res) => {
  const { userId, password } = req.body;
  // 요청으로 정보가 들어오지 않았다면 다음을 리턴한다.
  if( !userId, !password ) return res.status(400).send('Bad Request.');
  // 요청으로 들어온 정보로 유저를 조회한다.
  User
    .findOne({ where: { userId, password }})
    .then((data) => {
      // 요청으로 들어온 유저 정보에 해당하는 유저가 없으면 리턴한다.
      if( !data ) return res.status(401).json({ data: null, message: 'not authorized' });
      // 유저 비밀번호 정보를 지운다.
      delete data.dataValues.password;
      // 토큰을 생성한다.
      const accessToken = generateAccessToken(data.dataValues);
      const refreshToken = generateRefreshToken(data.dataValues);
      // 리프레시 토큰 쿠키 생성 및 에세스 토큰을 응답으로 보낸다.
      sendRefreshToken(res, refreshToken);
      sendAccessToken(res, accessToken);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500) // Server error
    });
};
