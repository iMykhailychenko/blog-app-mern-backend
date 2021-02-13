import express from 'express';
import cors from 'cors';

import * as path from 'path';
import connection from './db/connection';
import config from './services/config';
import logger from './services/logger';

import auth from './api/auth/auth.router';
import users from './api/users/users.router';
import posts from './api/posts/posts.router';
import comments from './api/comments/comments.router';
import feedback from './api/feedback/feedback.router';
import settings from './api/settings/settings.router';
import trending from './api/trending/trending.router';

const app = express();
const PORT = config.port;

async function main() {
    await connection.connect();
    // logger
    logger.init();
    app.use(logger.middleware);

    // middlewares
    app.use(cors());
    app.use(express.static(path.join(process.cwd(), 'uploads')));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json({ limit: '10mb', extended: true }));

    // routes
    app.use('/api/auth/', auth);
    app.use('/api/users/', users);
    app.use('/api/posts/', posts);
    app.use('/api/comments/', comments);
    app.use('/api/feedback/', feedback);
    app.use('/api/settings/', settings);
    app.use('/api/trending/', trending);

    // run server
    app.listen(PORT, () => console.log('Run on port:', PORT));

    // exit
    process.on('SIGILL', () => {
        connection.close();
    });
}

main().catch(console.error);
