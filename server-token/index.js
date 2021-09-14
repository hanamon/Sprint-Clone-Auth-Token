require('dotenv').config();
const fs = require('fs');
const https = require('https');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const controllers = require('./controllers');

// 미들웨어
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
}));

// 라우팅
app.post('/login', controllers.login);
app.get('/accesstokenrequest', controllers.accessTokenRequest);
app.get('/refreshtokenrequest', controllers.refreshTokenRequest);

// 포트 설정
const HTTPS_PORT = process.env.HTTPS_PORT || 4000;

// 서버 실행
let server;

/**
 * 인증서 파일들이 존재하는 경우에만 HTTPS 프로토콜을 사용하는 서버를 실행한다.
 * 만약 인증서 파일이 존재하지 않는 경우, HTTP 프로토콜을 사용하는 서버를 실행한다.
 * 파일 존재 여부를 확인하는 폴더는 서버 폴더의 package.json 이 위치한 곳이다.
 */
if( fs.existsSync('./key.pem') && fs.existsSync('./cert.pem')) {
  // 파일을 동기적으로 읽는다.
  const privateKey = fs.readFileSync(__dirname + '/key.pem', 'utf8');
  const certificate = fs.readFileSync(__dirname + '/cert.pem', 'utf-8');
  // 읽어온 파일 데이터로 객체를 만든다.
  const credentials = { key: privateKey, cert: certificate };
  // HTTPS 프로토콜을 사용하는 서버를 생성한다.
  server = https.createServer(credentials, app);
  // 서버를 실행한다.
  server.listen(HTTPS_PORT, () => console.log('🚀 server running - HTTPS', HTTPS_PORT));
}
else {
  server = app.listen(HTTPS_PORT, () => console.log('🚀 server running - HTTP', HTTPS_PORT));
}

module.exports = server;
