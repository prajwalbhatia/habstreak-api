import jwt from 'jsonwebtoken';

const isUserAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const isCustomAuth = token.length < 500;
    let decodedData;

    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, process.env.JWT_SECRET)
      req.userId = decodedData.id;
    }
    else {
      decodedData = jwt.decode(token);
      req.userId = decodedData.sub;
    }

    next();
  } catch (error) {
  console.log('🚀 ~ file: auth.js ~ line 20 ~ isUserAuthenticated ~ error', error);

  }

}

export default isUserAuthenticated;