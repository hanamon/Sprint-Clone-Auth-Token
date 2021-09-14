require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = {
  generateAccessToken: (data) => {
    return jwt.sign(data, process.env.ACCESS_SECRET, { expiresIn: '1h' });
  },
  generateRefreshToken: (data) => {
    return jwt.sign(data, process.env.REFRESH_SECRET, { expiresIn: '7d' });
  },
  sendRefreshToken: (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
  },
  sendAccessToken: (res, accessToken) => {
    res.status(200).json({ data: { accessToken }, message: 'ok' });
  },
  resendAccessToken: (res, accessToken, userInfo) => {
    res.status(200).json({ data: { accessToken, userInfo }, message: 'ok' });
  },
  isAuthorized: (req) => {
    // 요청 헤더에 authorization 가 있는지 확인한다.
    const authorization = req.headers['authorization'];
    if( !authorization ) return null;
    const accessToken = authorization.split(' ')[1];
    try {
      return jwt.verify(accessToken, process.env.ACCESS_SECRET);
    } catch (err) {
      // 에세스 토큰 검증 실패 시 null을 반환한다.
      return null;
    }
  },
  checkRefeshToken: (refreshToken) => {
    try {
      return jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    } catch (err) {
      // 리프레시 토큰 검증 실패 시 null을 반환한다.
      return null;
    }
  }
};
