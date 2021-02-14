import express from 'express';

import * as controller from './trending.controller';

const router = express.Router();

// posts
router.get('/posts', controller.getTrendingPosts);
// tags
router.get('/tags', controller.getTrendingTags);

export default router;
