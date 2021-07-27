import express from 'express';

import auth from "../middleware/auth.js";

//Controllers
import { createReward , getRewards , updateReward , deleteReward} from '../controllers/reward.js';

const router = express.Router();

router.post('/', createReward);
router.get('/', getRewards);
router.delete('/:id', deleteReward);
router.patch('/:id', updateReward);

export default router;
