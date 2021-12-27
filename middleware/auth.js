import jwt from 'jsonwebtoken';

const isUserAuthenticated = async (req, res, next) => {
console.log('🚀 ~ file: auth.js ~ line 4 ~ isUserAuthenticated ~ req', req.headers);
  const token = req.headers.authorization.split(" ")[1];

  let decodeData;
  if (token) {
    decodeData = jwt.decode(token);
    req.userId = decodeData.sub;
  }

  next();
}


export default isUserAuthenticated;