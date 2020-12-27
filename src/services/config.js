import dotenv from 'dotenv';

dotenv.config();
const config = {
  port: process.env.PORT || 7000,
  db: {
    url: process.env.DB_URL,
  },
  auth: {
    accessKey: process.env.ACCESS_KEY,
    salt: +process.env.SALT,
  },
};

export default config;
