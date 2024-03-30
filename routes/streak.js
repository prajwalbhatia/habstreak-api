import express from 'express';
import isUserAuthenticated from '../middleware/auth.js';

//Controllers
import { createStreak, getStreaks, getStreak, deleteStreak, updateStreak, deleteStreakAndRewardUpdate, deleteStreakAndRewardDelete } from './../controllers/streak.js';

const router = express.Router();

router.post('/', isUserAuthenticated, createStreak);
router.get('/', isUserAuthenticated, getStreaks);
router.get('/:id', isUserAuthenticated, getStreak);
router.delete('/:id', isUserAuthenticated, deleteStreak);
router.delete('/:id/deleteAndUpdate', isUserAuthenticated, deleteStreakAndRewardUpdate);
router.delete('/:id/deleteStreakAndReward', isUserAuthenticated, deleteStreakAndRewardDelete);
router.patch('/:id', isUserAuthenticated, updateStreak);

export default router;
