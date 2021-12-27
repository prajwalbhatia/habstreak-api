import User from '../models/user.js';

export const createUser = async (req, res) => {
  const user = req.body;
  console.log('🚀 ~ file: user.js ~ line 5 ~ createUser ~ user', user);
  const googleId = user.googleId;
  console.log('🚀 ~ file: user.js ~ line 7 ~ createUser ~ googleId', googleId);
  const findUser = await User.find({ googleId });
  console.log('🚀 ~ file: user.js ~ line 9 ~ createUser ~ findUser', findUser);

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


