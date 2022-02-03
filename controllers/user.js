import User from '../models/user.js';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const createUser = async (req, res) => {
  const user = req.body;
  const { email, name } = user;
  const findUser = await User.find({ email });

  if (findUser.length === 0) {
    try {
      const newUser = new User({ email, name, fromGoogle: true });
      await newUser.save();
      // const newUser = new UserDetail.create({ email, name });
      // await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      console.warn(error.message)
      res.status(409).json({ message: error.message });
    }
  }
  else {
    res.status(201).json(findUser[0]);
  }
}

export const signUp = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;

  try {
    if (!password || password.length === 0) res.status(400).json({ message: "Empty password is not allowed" });

    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(400).json({ message: "User already exist." });

    if (password !== confirmPassword) res.status(400).json({ message: "Password don't match." });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({ email, password: hashedPassword, name: `${firstName} ${lastName}`, fromGoogle: false });

    //Saving user detail
    // const newUser = new UserDetail({ email, name: `${firstName} ${lastName}` });
    // await newUser.save();

    const token = jwt.sign(
      { email: result.email, id: result._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EXPIRES_IN }
    );

    res.status(200).json({ result, token });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) return res.status(404).json({ message: "User doesn't exist." });

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EXPIRES_IN }
    );

    res.status(200).json({ result: existingUser, token });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

