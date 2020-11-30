import express from 'express';
import * as controller from './pictures.controller';

const router = express.Router();

router.get('/', controller.getPictures);
router.get('/random', controller.randomPicture);

export default router;
