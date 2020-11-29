import express from 'express';
import * as controller from './feedback.controller';
import checkToken from '../../middlewares/auth';

const router = express.Router();

router.post('/like/:postId', checkToken, controller.like);
router.post('/dislike/:postId', checkToken, controller.dislike);

export default router;
