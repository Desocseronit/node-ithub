require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  DBURL: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
};
