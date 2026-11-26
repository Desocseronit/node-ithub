const jwt = require('jsonwebtoken');
const config = require('../config');

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, config.jwtAccessSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwtAccessSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwtRefreshSecret);
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
};
