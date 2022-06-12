import express from 'express';
import isUserAuthenticated from '../middleware/auth.js';


//Controllers
import {
  createUser,
  signUp,
  signIn,
  refreshToken,
  logout,
  updateUser,
  verifyEmail,
  checkUserExist,
} from './../controllers/user.js';

const router = express.Router();

router.post('/', createUser);
router.post('/check' , checkUserExist)
router.patch('/:email', isUserAuthenticated, updateUser);
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/verifyEmail', verifyEmail);
router.post('/refreshToken' , refreshToken);
router.post('/logout' , isUserAuthenticated , logout);

export default router;
