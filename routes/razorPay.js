import express from 'express';


//Controllers
import { razorPay , verification} from '../controllers/razorPay.js';
import isUserAuthenticated from '../middleware/auth.js';


const router = express.Router();

router.post('/verification', verification);
router.post('/', razorPay);

export default router;
