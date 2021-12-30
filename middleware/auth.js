import jwt from 'jsonwebtoken';

const isUserAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  let decodeData;
  if (token) {
    decodeData = jwt.decode(token);
    req.userId = decodeData.sub;
  }

  next();
}


export default isUserAuthenticated;