import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import fs from 'fs';

import * as path from 'path';
import connection from './db/connection';
import config from './services/config';

import auth from './api/auth/auth.router';
import users from './api/users/users.router';
import posts from './api/posts/posts.router';
import comments from './api/comments/comments.router';
import feedback from './api/feedback/feedback.router';
import settings from './api/settings/settings.router';

const app = express();
const PORT = config.port;

// logger config
const stream = fs.createWriteStream(path.join(process.cwd(), 'access.log'), { flags: 'a' });
morgan.token('auth', req => req.headers.authorization);

const logger = morgan(
    'info :method :url HTTP/:http-version \nwarning :status :referrer \nuser-agent: :user-agent \nauth: :auth\n',
    {
        stream,
        skip: req => req.headers.accept.includes('image'),
    },
);

async function main() {
    await connection.connect();
    // logger
    app.use(logger);

    // middlewares
    app.use(cors());
    app.use(express.static('uploads'));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json({ limit: '10mb', extended: true }));

    // routes
    app.use('/api/auth/', auth);
    app.use('/api/users/', users);
    app.use('/api/posts/', posts);
    app.use('/api/comments/', comments);
    app.use('/api/feedback/', feedback);
    app.use('/api/settings/', settings);

    // run server
    app.listen(PORT, () => console.log('Run on port:', PORT));

    process.on('SIGILL', () => {
        connection.close();
    });
}

main().catch(console.error);
