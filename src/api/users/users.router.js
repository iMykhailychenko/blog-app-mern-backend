import express from 'express';
import * as controller from './users.controller';
import checkToken from '../../middlewares/auth';

const router = express.Router();

router.put('/followers/:userId', checkToken, controller.putFollowers);
router.get('/profile/:userId', controller.getUserById);
router.get('/profile/:userId/followers', controller.searchFollowers);
router.get('/profile/:userId/following', controller.searchFollowing);
router.get('/profile', checkToken, controller.getUser);

export default router;
