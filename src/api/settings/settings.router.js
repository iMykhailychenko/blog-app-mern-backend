import express from 'express';

import * as controller from './settings.controller';
import checkToken from '../../middlewares/auth';
import config from '../../services/config';

const router = express.Router();

router.put('/avatar', checkToken, config.uploads.single('avatar'), controller.updateAvatar);
router.put('/banner', checkToken, config.uploads.single('banner'), controller.updateBanner);
router.put('/user', checkToken, controller.updateUser);
router.put('/desc', checkToken, controller.aboutUser);

export default router;
