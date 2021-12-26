import express from 'express';

import auth from "../middleware/auth.js";

//Controllers
import { createReward, getRewards, updateReward, deleteReward, deleteRewardsBulk } from '../controllers/reward.js';
import isUserAuthenticated from '../middleware/auth.js';

const router = express.Router();

router.post('/', isUserAuthenticated, createReward);
router.get('/', isUserAuthenticated, getRewards);
router.delete('/:id', isUserAuthenticated, deleteReward);
router.delete('/:streakId/bulk', isUserAuthenticated, deleteRewardsBulk);
router.patch('/:id', isUserAuthenticated, updateReward);

export default router;
