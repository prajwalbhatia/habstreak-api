import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';

export const signin = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User doesn't exists" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ email: user.email, id: user._id }, 'test', { expiresIn: '1h' });

    res.status(200).json({ result: user, token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export const signup = async (req, res) => {
  const { username, email, password } = req.body

  try {
    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "User already exists" });

    const hashPassword = await bcrypt.hash(password, 12);
    
    const result = await User.create({ username, password: hashPassword , email });

    const token = jwt.sign({ email: result.email, id: result._id }, 'test', { expiresIn: '1h' });

    res.status(200).json({ result, token });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Something went wrong' });
  }
}