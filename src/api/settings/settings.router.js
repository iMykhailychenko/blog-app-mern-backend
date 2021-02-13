import express from 'express';

import * as controller from './settings.controller';
import auth from '../../middlewares/auth';
import config from '../../services/config';

const router = express.Router();

router.put('/avatar', auth, config.uploads.single('avatar'), controller.updateAvatar);
router.put('/banner', auth, config.uploads.single('banner'), controller.updateBanner);
router.put('/user', auth, controller.updateUser);
router.put('/bio', auth, controller.updateBio);
router.put('/password', auth, controller.changePass);

export default router;
