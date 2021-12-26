import express from 'express';
import isUserAuthenticated from '../middleware/auth.js';

import auth from "../middleware/auth.js";

//Controllers
import {
  createStreakDetail,
  getStreakDetail,
  updateStreakDetail,
  deleteStreakDetail
} from './../controllers/streakDetail.js';

const router = express.Router();

router.post('/', isUserAuthenticated, createStreakDetail);
router.get('/:streakId', isUserAuthenticated, getStreakDetail);
router.patch('/:id', isUserAuthenticated, updateStreakDetail);
router.delete('/:streakId', isUserAuthenticated, deleteStreakDetail);

export default router;
