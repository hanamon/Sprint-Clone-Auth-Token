const { User } = require('../../models');
const { isAuthorized } = require('../tokenFunctions');

module.exports = (req, res) => {
  // 에세스 토큰이 유효한지 검사한다.
  const accessTokenData = isAuthorized(req);
  // 에세스 토큰이 유효하지 않으면 다음을 리턴한다.
  if( !accessTokenData ) res.status(401).json({ data: null, message: 'invalid access token'});
  
  const { userId } = accessTokenData;
  User
    .findOne({ where: { userId }})
    .then((data) => {
      // 에세스 토큰이 유효하지만 토큰에 해당하는 유저가 존재하지 않는다.
      if( !data ) return res.status(204).json({ data: null, message: 'access token has been tepered'});
      // 에세스 토큰이 유효하고 해당 유저도 존재한다면 유저의 비밀번호를 삭제한 정보를 응답으로 돌려준다.
      delete data.dataValues.password;
      return res.status(200).json({ data: { userInfo: data.dataValues}, message: 'ok' });
    })
    .catch((err) => {
      console.log(err);
      return res.sendStatus(500) // Server error
    });
};
