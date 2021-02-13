import express from 'express';
import * as controller from './auth.controller';
import auth from '../../middlewares/auth';
import authValidate from '../../middlewares/authValidate';

const router = express.Router();

router.post('/register', authValidate, controller.registration);
router.post('/login', controller.login);
router.post('/logout', auth, controller.logout);

export default router;
