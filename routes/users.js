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
  resendOtp,
  generate2faOtp,
  verify2faOtp,
  validate2faOtp,
  disable2faOtp
} from './../controllers/user.js';

const router = express.Router();

router.post('/otp/generate', isUserAuthenticated , generate2faOtp);
router.post('/otp/verify', isUserAuthenticated , verify2faOtp);
router.post('/otp/validate', isUserAuthenticated , validate2faOtp);
router.post('/otp/disable', isUserAuthenticated , disable2faOtp);
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
