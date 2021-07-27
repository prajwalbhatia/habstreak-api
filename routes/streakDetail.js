import express from 'express';

import auth from "../middleware/auth.js";

//Controllers
import {
  createStreakDetail,
  getStreakDetail,
  updateStreakDetail,
  deleteStreakDetail
} from './../controllers/streakDetail.js';

const router = express.Router();

router.post('/', createStreakDetail);
router.get('/:streakId', getStreakDetail);
router.patch('/:id', updateStreakDetail);
router.delete('/:streakId', deleteStreakDetail);

export default router;
