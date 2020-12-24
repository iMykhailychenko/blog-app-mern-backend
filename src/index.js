import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import connection from './db/connection';
import config from './services/config';

import auth from './api/auth/auth.router';
import users from './api/users/users.router';
import posts from './api/posts/posts.router';
import feedback from './api/feedback/feedback.router';
import pictures from './api/pictures/pictures.router';

const app = express();
const PORT = config.port || 3000;

async function main() {
  await connection.connect();

  morgan('tiny');
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: '10mb', extended: true }));

  // routes
  app.use('/api/auth/', auth);
  app.use('/api/users/', users);
  app.use('/api/posts/', posts);
  app.use('/api/feedback/', feedback);
  app.use('/api/pictures/', pictures);

  // run server
  app.listen(PORT, () => console.log('Run on port:', PORT));

  process.on('SIGILL', () => {
    connection.close();
  });
}

main().catch(console.error);
