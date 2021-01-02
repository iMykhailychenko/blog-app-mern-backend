import express from 'express';
import multer from 'multer';
import * as controller from './posts.controller';
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

const upload = multer({ storage }).single('banner');

router.get('/', controller.getPosts);
router.get('/:postId', controller.getSinglePosts);
router.put('/:postId', checkToken, controller.updatePost);
router.delete('/:postId', checkToken, postIdValidate, controller.deletePost);
router.post('/', checkToken, upload, controller.createPost);

export default router;
