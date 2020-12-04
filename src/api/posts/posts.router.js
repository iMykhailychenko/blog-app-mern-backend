import express from 'express';
import * as controller from './posts.controller';
import checkToken from '../../middlewares/auth';

const router = express.Router();

router.get('/', controller.getPosts);
router.get('/:postId', controller.getSinglePosts);
router.put('/:postId', checkToken, controller.updatePost);
router.post('/', checkToken, controller.createPost);

export default router;
