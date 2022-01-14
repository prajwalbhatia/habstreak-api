import express from 'express';

//Controllers
import { getRecentActivities } from '../controllers/recentActivities.js';
import isUserAuthenticated from '../middleware/auth.js';

const router = express.Router();

router.get('/', isUserAuthenticated, getRecentActivities);

export default router;
