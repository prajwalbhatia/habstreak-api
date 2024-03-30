import User from "../models/user.js";
import RefreshToken from "../models/refreshToken.js";
import VerificationToken from "../models/verificationToken.js";

import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import {
  generateOtp,
  mailTrasport,
  otpTemplate,
  throwError,
} from "../utils.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as OTPAuth from "otpauth";
import hiBase32 from "hi-base32";

import mongodb from "mongodb";
import moment from "moment";
import cron from "node-cron";

const { ObjectId } = mongodb;
const { encode } = hiBase32;

let err = {};

const generateRandomBase32 = () => {
  const buffer = crypto.randomBytes(15);
  const base32 = encode(buffer).replace(/=/g, "").substring(0, 24);
  return base32;
};

const storeInCookie = async (token, type, res, req) => {
  const tokenName = type === "token" ? "x-token" : "x-refreshToken";
  res.cookie(tokenName, token, {
    httpOnly: true,
    secure: true,
    path: "/",
  });
};

const generateToken = (type, user) => {
  if (type === "token") {
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );
    return token;
  } else {
    const refreshToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "7d" }
    );

    return refreshToken;
  }
};

export const generate2faOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser) throwError(400, "User doesn't exists", next);

  const base32_secret = generateRandomBase32();

  let totp = new OTPAuth.TOTP({
    issuer: "habstreak.com",
    label: "habstreak totp",
    algorithm: "SHA1",
    digits: 6,
    secret: base32_secret,
  });

  let otpauth_url = totp.toString();

  await User.findByIdAndUpdate(
    { _id: mongoose.Types.ObjectId(existingUser?._id) },
    {
      otpAuthUrl: otpauth_url,
      otpBase32: base32_secret,
    }
  );

  res.status(200).json({
    base32: base32_secret,
    otpBase32: otpauth_url,
  });
});

export const verify2faOtp = asyncHandler(async (req, res, next) => {
  const { email, token } = req.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser)
    throwError(400, "User doesn't exists or token is invalid", next);

  let totp = new OTPAuth.TOTP({
    issuer: "habstreak.com",
    label: "habstreak totp",
    algorithm: "SHA1",
    digits: 6,
    secret: existingUser?.otpBase32,
  });

  let delta = totp.validate({ token });

  if (delta === null) {
    throwError(400, "User doesn't exists or token is invalid", next);
  } else {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: mongoose.Types.ObjectId(existingUser?._id) },
      {
        otpEnabled: true,
        otpVerified: true,
      }
    );

    res.status(200).json({
      otpVerified: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        otp_enabled: updatedUser.otpEnabled,
      },
    });
  }
});

export const validate2faOtp = asyncHandler(async (req, res, next) => {
  const { email, token } = req.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser)
    throwError(400, "User doesn't exists or token is invalid", next);

  let totp = new OTPAuth.TOTP({
    issuer: "habstreak.com",
    label: "habstreak totp",
    algorithm: "SHA1",
    digits: 6,
    secret: existingUser?.otpBase32,
  });

  let delta = totp.validate({ token, window: 1 });

  if (delta === null) {
    throwError(400, "User doesn't exists or token is invalid", next);
  } else {
    res.status(200).json({
      otp_valid: true,
    });
  }
});

export const disable2faOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser)
    throwError(400, "User doesn't exists or token is invalid", next);

  const updatedUser = await User.findByIdAndUpdate(
    { _id: mongoose.Types.ObjectId(existingUser?._id) },
    {
      otpEnabled: false,
      otpVerified: false,
    }
  );

  res.status(200).json({
    otpDisabled: true,
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      otp_enabled: updatedUser.otpEnabled,
    },
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const user = req.body;
  const { email, name } = user;

  const findUser = await User.find({ email });

  const tokenGenerator = async (user) => {
    const token = generateToken("token", user);
    const refreshToken = generateToken("refreshToken", user);

    const tokenObj = { refreshToken };
    const newRefreshToken = new RefreshToken(tokenObj);

    await newRefreshToken.save();

    await storeInCookie(token, "token", res, req);
    await storeInCookie(refreshToken, "refresh", res, req);
  };

  if (findUser.length === 0) {
    const newUser = new User({ email, name, fromGoogle: true, verified: true });

    await tokenGenerator(newUser);
    await newUser.save();

    res.status(201).json(newUser);
  } else {
    await tokenGenerator(findUser[0]);

    res.status(201).json(findUser[0]);
  }
});

export const getUser = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const findUser = await User.findOne({ email });

  if (findUser) {
    res.status(201).json(findUser);
  }
});

export const signUp = asyncHandler(async (req, res, next) => {
  const { email, password, confirmPassword, fullName } = req.body;

  if (!password || password.length === 0)
    throwError(400, "Empty password is not allowed", next);

  const existingUser = await User.findOne({ email });

  if (existingUser) return throwError(400, "User already exists", next);

  if (password !== confirmPassword)
    throwError(400, "Password don't match", next);

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await User.create({
    email,
    password: hashedPassword,
    name: fullName,
    fromGoogle: false,
  });

  //GENERATING OTP
  const OTP = generateOtp();
  const verificationToken = new VerificationToken({
    owner: result._id,
    token: OTP,
  });

  //Saving user detail
  const token = generateToken("token", result);
  const refreshToken = generateToken("refreshToken", result);

  await storeInCookie(token, "token", res, req);

  await storeInCookie(refreshToken, "refresh", res, req);

  const tokenObj = { refreshToken };
  const newToken = new RefreshToken(tokenObj);

  await verificationToken.save();
  await newToken.save();

  mailTrasport().sendMail({
    from: '"Habstreak" <support@habstreak.com>',
    to: result.email,
    subject: "Verify your email account",
    html: otpTemplate(OTP),
  });

  const {
    name,
    email: userEmail,
    fromGoogle,
    verified,
    _id,
    planType,
    startTime,
    endTime,
  } = result;

  let userObj = {
    name,
    email: userEmail,
    fromGoogle,
    verified,
    _id,
    planType,
    startTime,
    endTime,
  };

  res.status(200).json({ result: userObj });
});

export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser) throwError(400, "User doesn't exists", next);

  if (existingUser && existingUser.fromGoogle)
    throwError(400, "Same user is already logged in through Google", next);

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password
  );

  if (!isPasswordCorrect) throwError(400, "Invalid credentials", next);

  //GENERATING OTP
  let verificationToken;
  let OTP;
  if (!existingUser.verified) {
    OTP = generateOtp();
    verificationToken = new VerificationToken({
      owner: existingUser._id,
      token: OTP,
    });
    await verificationToken.save();
  }

  const token = generateToken("token", existingUser);
  const refreshToken = generateToken("refreshToken", existingUser);

  await storeInCookie(token, "token", res, req);

  await storeInCookie(refreshToken, "refresh", res, req);

  const tokenObj = { refreshToken };
  const newToken = new RefreshToken(tokenObj);

  await newToken.save();

  if (!existingUser.verified) {
    mailTrasport().sendMail({
      from: '"Habstreak" <support@habstreak.com>',
      to: email,
      subject: "Verify your email account",
      html: otpTemplate(OTP),
    });
  }

  const {
    name,
    email: userEmail,
    fromGoogle,
    verified,
    _id,
    planType,
    startTime,
    endTime,
  } = existingUser;

  let userObj = {
    name,
    email: userEmail,
    fromGoogle,
    verified,
    _id,
    planType,
    startTime,
    endTime,
  };

  res.status(200).json({ result: userObj });
});

export const resendOtp = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) throwError(400, "Invalid request, missing parameters!", next);

  const user = await User.findOne({ _id: ObjectId(userId) });
  if (!user) throwError(400, "User not found", next);
  if (user.verified) throwError(400, "User already verified", next);

  await VerificationToken.findByIdAndDelete({ _id: user._id });

  let verificationToken;
  let OTP;
  // if (!user.verified) {
  OTP = generateOtp();
  verificationToken = new VerificationToken({
    owner: user._id,
    token: OTP,
  });
  await verificationToken.save();

  mailTrasport().sendMail({
    from: '"Habstreak" <support@habstreak.com>',
    to: user.email,
    subject: "Verify your email account",
    html: otpTemplate(OTP),
  });

  res.status(200).json({ message: "OTP IS SENT" });

  // }
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { userId, otp } = req.body;

  if (!userId || !otp.trim())
    throwError(400, "Invalid request, missing parameters!", next);

  const user = await User.findOne({ _id: ObjectId(userId) });

  if (!user) throwError(400, "User not found", next);

  if (user.verified) throwError(400, "User already verified", next);

  const token = await VerificationToken.findOne({ owner: user._id });
  if (!token) throwError(400, "User not found", next);

  const isMatched = await token.compareToken(otp);

  if (!isMatched) throwError(400, "Please provide valid otp");

  user.verified = true;

  await VerificationToken.findByIdAndDelete({ _id: token._id });

  await user.save();

  // mailTrasport().sendMail({
  //   from: 'support@habstreak.com',
  //   to: user.email,
  //   subject: "Verify your email account"
  //   html: ``
  // })
  res.status(200).json({ message: "Your email is verified", result: user });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies["x-refreshToken"];
  if (!refreshToken) throwError(401, "Refresh token is not available", next);

  const refreshTokens = await RefreshToken.find({ refreshToken }).lean();

  if (refreshTokens.length === 0)
    throwError(403, "Refresh token is not valid", next);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_JWT_SECRET,
    async (err, user) => {
      if (err) {
        throwError(403, "Token is Expired", next);
        return;
      }
      const newToken = generateToken("token", {
        email: user.email,
        _id: user.id,
      });
      const newRefreshToken = generateToken("refreshToken", {
        email: user.email,
        _id: user.id,
      });

      await RefreshToken.deleteOne({ refreshToken });

      const tokenObj = { refreshToken: newRefreshToken };
      const tokenForDb = new RefreshToken(tokenObj);

      await tokenForDb.save();

      await storeInCookie(newToken, "token", res, req);

      await storeInCookie(newRefreshToken, "refresh", res, req);

      res.status(200).json({ result: user });
    }
  );
});

export const logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  res.clearCookie("x-refreshToken");
  res.clearCookie("x-token");

  if (!req.userId) throwError(next);

  await RefreshToken.deleteOne({ refreshToken });
  res.status(200).json({ message: "You logged out successfully" });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const { email } = req.params;
  if (!req.userId) {
    throwError(next);
  }

  const user = req.body;
  const updatedUser = await User.findOneAndUpdate({ email }, user, {
    new: true,
  });
  if (!updateUser) throwError(404, `User not found with email ${email}`, next);

  res.json(updatedUser);
});

export const checkUserExist = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const users = await User.find();

  const filtered = users.filter((user) => user.email === email);
  let ifExist = filtered.length > 0 ? true : false;
  res.status(200).json(ifExist);
});

export const checkUserExistFromGoogle = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const users = await User.find();
  let userExistFromGoogle = null;

  const filtered = users.filter((user) => user.email === email);

  if (filtered.length > 0) {
    userExistFromGoogle = filtered[0].fromGoogle;
  }

  res.status(200).json(userExistFromGoogle);
});

cron.schedule(
  "1 0 * * *",
  async () => {
    try {
      //Getting users
      const users = await User.find().lean();

      await Promise.all(
        users.map(async (user) => {
          if (user.endTime.length > 0) {
            let currentDate = moment().endOf("day").format();
            if (moment(currentDate).isAfter(moment(user.endTime))) {
              const updateObj = {
                planType: "free",
                startTime: "",
                endTime: "",
                orderId: "",
                paymentId: "",
              };
              await User.findByIdAndUpdate(user._id, updateObj, { new: true });
            }
          }
        })
      );
    } catch (error) {
      console.warn(error._message);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);
