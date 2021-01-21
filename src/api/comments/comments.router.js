import express from 'express';
import multer from 'multer';
import * as controller from './comments.controller';
import checkToken from '../../middlewares/auth';
import postIdValidate from '../../middlewares/postIdValidate';

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `IMG_${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({ storage }).single('attachment');

// comment actions
router.get('/:postId', postIdValidate, controller.getComments);
router.post('/:postId', checkToken, postIdValidate, upload, controller.postComment);
router.delete('/:commentId', checkToken, controller.deleteComment);
router.put('/:commentId', checkToken, upload, controller.editComment);
router.post('/:postId/:commentId', checkToken, postIdValidate, upload, controller.answerComment);

export default router;
