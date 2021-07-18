import express from 'express';

import auth from "../middleware/auth.js";

//Controllers
import { createStreakDetail , getStreakDetail, updateStreakDetail} from './../controllers/streakDetail.js';

const router = express.Router();

router.post('/', createStreakDetail);
router.get('/:streakId', getStreakDetail);
router.patch('/:id', updateStreakDetail);

export default router;
