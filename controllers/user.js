import User from '../models/user.js';

export const createUser = async (req, res) => {
  const user = req.body;
  const googleId = user.googleId;
  const findUser = await User.find({ googleId });

  if (findUser.length === 0) {
    const newUser = new User(user);
    try {
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      console.warn(error.message)
      res.status(409).json({ message: error.message });
    }
  }
  else
  {
    res.status(201).json(findUser[0]);
  }
  
}


