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
  getUser,
  checkUserExistFromGoogle,
  resendOtp
} from './../controllers/user.js';

const router = express.Router();

router.post('/', createUser);
router.get('/:email', getUser);
router.post('/check' , checkUserExist)
router.post('/checkFromGoogle', checkUserExistFromGoogle)
router.patch('/:email', isUserAuthenticated, updateUser);
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/verifyEmail', verifyEmail);
router.post('/resendOtp' , resendOtp);
router.post('/refreshToken' , refreshToken);
router.post('/logout' , isUserAuthenticated , logout);

export default router;
