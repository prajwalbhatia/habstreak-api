import jwt from "jsonwebtoken";
import { throwError } from "../utils.js";

const isUserAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies["x-token"];

    if (token) {
      const decodeToken = jwt.decode(token);
      const currentDate = new Date();

      if (decodeToken.exp && decodeToken.exp * 1000 < currentDate.getTime()) {
        throwError(403, "Access token expired. Please re-authenticate.", next);
      } else {
        const isCustomAuth = token?.length < 500;
        let decodedData;

        if (token && isCustomAuth) {
          decodedData = jwt.verify(token, process.env.JWT_SECRET);
          req.userId = decodedData.id;
        } else {
          decodedData = jwt.decode(token);
          req.userId = decodedData.sub;
        }
        next();
      }
    } else {
      throwError(401, "Unauthorized", next);
    }
  } catch (error) {
    console.log("🚀 ~ isUserAuthenticated ~ error:", error);
    throwError(401, error, next);
  }
};

export default isUserAuthenticated;
