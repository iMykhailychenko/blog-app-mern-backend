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

router.get('/:postId', checkToken, postIdValidate, controller.getComments);
router.post('/:postId', checkToken, postIdValidate, upload, controller.postComment);
router.post(
  '/:postId/:commentId',
  checkToken,
  postIdValidate,
  upload,
  controller.answerComment,
);

export default router;
