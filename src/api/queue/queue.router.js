import express from 'express';

import * as controller from './queue.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/', auth, controller.getQueue);
router.put('/', auth, controller.putQueue);

export default router;
