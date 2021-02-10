import express from 'express';

import * as controller from './favorite.controller';

const router = express.Router();

// posts
router.get('/posts', controller.getFavoritePosts);

// tags
router.get('/tags', controller.getFavoriteTags);

export default router;
