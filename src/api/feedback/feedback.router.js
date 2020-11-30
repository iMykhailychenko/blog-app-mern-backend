import express from 'express';
import * as controller from './feedback.controller';
import checkToken from '../../middlewares/auth';

const router = express.Router();

router.put('/like/:postId', checkToken, controller.like);
router.put('/dislike/:postId', checkToken, controller.dislike);

export default router;
