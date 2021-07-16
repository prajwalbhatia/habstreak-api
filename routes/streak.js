import express from 'express';

import auth from "../middleware/auth.js";

//Controllers
import { createStreak, getStreaks, deleteStreak, updateStreak } from './../controllers/streak.js';

const router = express.Router();

router.post('/', createStreak);
router.get('/', getStreaks);
router.delete('/:id', deleteStreak);
router.patch('/:id', updateStreak);

export default router;
