import express from 'express';

//Controllers
import {
  createUser,
  signUp,
  signIn,
  refreshToken
} from './../controllers/user.js';

const router = express.Router();

router.post('/', createUser);
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refreshToken', refreshToken)

export default router;
