import express from 'express';
import * as controller from './feedback.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// posts
router.put('/like/:postId', auth, controller.likePost);
router.put('/dislike/:postId', auth, controller.dislikePost);

// comments
router.put('/like/:commentId/comments', auth, controller.likeComment);
router.put('/dislike/:commentId/comments', auth, controller.dislikeComment);

// users
router.put('/like/:userId/users', auth, controller.likeUser);
router.put('/dislike/:userId/users', auth, controller.dislikeUser);

export default router;
