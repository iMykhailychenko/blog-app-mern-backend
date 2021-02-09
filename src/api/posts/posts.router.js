import express from 'express';
import * as controller from './posts.controller';
import checkToken from '../../middlewares/auth';
import postIdValidate from '../../middlewares/postIdValidate';
import config from '../../services/config';

const router = express.Router();

router.get('/', controller.getPosts);
router.get('/top', controller.getTopPost);
router.get('/:postId', controller.getSinglePosts);
router.get('/user/:userId', controller.getUserPosts);
router.put('/:postId', checkToken, controller.updatePost);
router.delete('/:postId', checkToken, postIdValidate, controller.deletePost);
router.post('/', checkToken, config.uploads.single('banner'), controller.createPost);
router.put('/:postId/banner', checkToken, postIdValidate, config.uploads.single('banner'), controller.updatePostBanner);

export default router;
