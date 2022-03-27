import User from '../models/user.js';
import RefreshToken from '../models/refreshToken.js';

import asyncHandler from 'express-async-handler';
import { throwError } from '../utils.js';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


let err = {};

const generateToken = (type, user) => {
  if (type === 'token') {
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return token
  }
  else {
    const refreshToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.REFRESH_JWT_SECRET,
    );

    return refreshToken;
  }
}

export const createUser = asyncHandler(async (req, res) => {
  const user = req.body;
  const { email, name } = user;
  const findUser = await User.find({ email });

  if (findUser.length === 0) {
    const newUser = new User({ email, name, fromGoogle: true });
    await newUser.save();
    res.status(201).json(newUser);
  }
  else {
    res.status(201).json(findUser[0]);
  }
});

export const signUp = asyncHandler(async (req, res, next) => {
  const { email, password, confirmPassword, fullName } = req.body;

  if (!password || password.length === 0) throwError(400, 'Empty password is not allowed', next);

  const existingUser = await User.findOne({ email });

  if (existingUser) return throwError(400, 'User already exists', next);

  if (password !== confirmPassword) throwError(400, 'Password don\'t match', next);

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await User.create({ email, password: hashedPassword, name: fullName, fromGoogle: false });

  //Saving user detail
  const token = generateToken('token', result);
  const refreshToken = generateToken('refreshToken', result);

  const tokenObj = { refreshToken };
  const newToken = new RefreshToken(tokenObj);

  await newToken.save();

  res.status(200).json({ result, token, refreshToken });

})

export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser) throwError(400, 'User doesn\'t exists', next);;

  const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordCorrect) throwError(400, 'Invalid credentials', next);;

  const token = generateToken('token', existingUser);
  const refreshToken = generateToken('refreshToken', existingUser);

  const tokenObj = { refreshToken };
  const newToken = new RefreshToken(tokenObj);
  await newToken.save();

  res.status(200).json({ result: existingUser, token, refreshToken });

})

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) throwError(401, 'Refresh token is not available', next);

  const refreshTokens = await RefreshToken.find({ refreshToken }).lean();

  if (refreshTokens.length === 0) throwError(403, 'Refresh token is not valid', next);


  jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, async (err, user) => {
    err && console.log(err);
    const newToken = generateToken('token', { email: user.email, _id: user.id });
    const newRefreshToken = generateToken('refreshToken', { email: user.email, _id: user.id });

    await RefreshToken.deleteOne({ refreshToken });

    const tokenObj = { refreshToken: refreshTokens[0].refreshToken };
    const tokenForDb = new RefreshToken(tokenObj);

    await tokenForDb.save();

    res.status(200).json({ result: user, token: newToken, refreshToken: newRefreshToken });

  });
})

export const logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!req.userId) throwError(next);

  const refreshTokens = await RefreshToken.deleteOne({ refreshToken });
  res.status(200).json({ message: 'You logged out successfully' });
})

export const updateUser = asyncHandler(async (req, res, next) => {
  const { email } = req.params;
  if (!req.userId) {
    throwError(next);
  }

  const user = req.body;
  // if (!mongoose.Types.ObjectId.isValid(id)) throwError(404, `${id} is invalid`, next);

  const updatedUser = await User.findOneAndUpdate(email, user, { new: true });
  if (!updateUser) throwError(404, `User not found with email ${email}`, next);
  // const activity = activityObj(req.userId, 'update-streak', streak.title, moment().format());
  // const newActivity = new RecentActivity(activity);
  // await newActivity.save();

  res.json(updatedUser);
})
