import express from 'express';
import * as controller from './feedback.controller';
import checkToken from '../../middlewares/auth';

const router = express.Router();

// posts
router.put('/like/:postId', checkToken, controller.likePost);
router.put('/dislike/:postId', checkToken, controller.dislikePost);

// comments
router.put('/like/:commentId/comments', checkToken, controller.likeComment);
router.put('/dislike/:commentId/comments', checkToken, controller.dislikeComment);

export default router;
