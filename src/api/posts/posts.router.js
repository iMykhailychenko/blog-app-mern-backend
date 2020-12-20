import express from 'express';
import multer from 'multer';
import * as controller from './posts.controller';
import checkToken from '../../middlewares/auth';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage }).single('banner');

router.get('/', controller.getPosts);
router.get('/:postId', controller.getSinglePosts);
router.put('/:postId', checkToken, controller.updatePost);
router.post('/', checkToken, controller.createPost);
router.post('/:postId', checkToken, upload, controller.uploadImg);

export default router;
