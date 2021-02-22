import express from 'express';
import * as controller from './auth.controller';
import auth from '../../middlewares/auth';
import authValidate from '../../middlewares/authValidate';

const router = express.Router();

router.post('/register', authValidate, controller.registration);
router.post('/login', controller.login);
router.post('/logout', auth, controller.logout);
// google auth
router.get('/google/url', controller.googleUrl);
router.get('/google', controller.google);
// facebook
router.get('/facebook/url', controller.facebookUrl);
router.get('/facebook', controller.facebook);

export default router;
