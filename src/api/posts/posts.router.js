import express from 'express';
import * as controller from './posts.controller';
import auth from '../../middlewares/auth';
import postIdValidate from '../../middlewares/postIdValidate';
import authCheck from '../../middlewares/authCheck';
import config from '../../services/config';

const router = express.Router();

router.get('/', authCheck, controller.getPosts);
router.get('/:postId', authCheck, controller.getSinglePosts);
router.get('/user/:userId', authCheck, controller.getUserPosts);
router.put('/:postId', auth, controller.updatePost);
router.delete('/:postId', auth, postIdValidate, controller.deletePost);
router.post('/', auth, config.uploads.single('banner'), controller.createPost);
router.put('/:postId/banner', auth, postIdValidate, config.uploads.single('banner'), controller.updatePostBanner);

export default router;
