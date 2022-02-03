import express from 'express';

//Controllers
import {
  createUser,
  signUp,
  signIn
} from './../controllers/user.js';

const router = express.Router();

router.post('/', createUser);
router.post('/signup', signUp);
router.post('/signin', signIn);

export default router;
