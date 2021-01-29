import express from 'express';
import * as controller from './comments.controller';
import checkToken from '../../middlewares/auth';
import postIdValidate from '../../middlewares/postIdValidate';
import config from '../../services/config';

const router = express.Router();

// comment actions
router.get('/:postId', postIdValidate, controller.getComments);
router.post('/:postId', checkToken, postIdValidate, config.uploads.single('attachment'), controller.postComment);
router.delete('/:commentId', checkToken, controller.deleteComment);
router.put('/:commentId', checkToken, config.uploads.single('attachment'), controller.editComment);
router.post(
    '/:postId/:commentId',
    checkToken,
    postIdValidate,
    config.uploads.single('attachment'),
    controller.answerComment,
);

export default router;
