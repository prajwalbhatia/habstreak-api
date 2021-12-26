import express from 'express';
import isUserAuthenticated from '../middleware/auth.js';

import auth from "../middleware/auth.js";

//Controllers
import { createStreak, getStreaks, deleteStreak, updateStreak } from './../controllers/streak.js';

const router = express.Router();

router.post('/', isUserAuthenticated , createStreak);
router.get('/', isUserAuthenticated , getStreaks);
router.delete('/:id', isUserAuthenticated , deleteStreak);
router.patch('/:id', isUserAuthenticated , updateStreak);

export default router;
