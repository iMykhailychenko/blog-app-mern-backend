import express from 'express';
import * as controller from './comments.controller';
import auth from '../../middlewares/auth';
import postIdValidate from '../../middlewares/postIdValidate';
import config from '../../services/config';

const router = express.Router();

// comment actions
router.get('/:postId', postIdValidate, controller.getComments);
router.post('/:postId', auth, postIdValidate, config.uploads.single('attachment'), controller.postComment);
router.delete('/:commentId', auth, controller.deleteComment);
router.put('/:commentId', auth, config.uploads.single('attachment'), controller.editComment);
router.post('/:postId/:commentId', auth, postIdValidate, config.uploads.single('attachment'), controller.answerComment);

export default router;
