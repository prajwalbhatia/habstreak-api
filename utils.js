export function activityObj(userId, type, title, date) {
  return {
    userId,
    type,
    title,
    date,
  }
}

export const unauthenticate = (next) => {
  let err = {};
  err.status = 401;
  err.message = 'Unauthentcated';
  return next(err);
}

/**
 * 
 * @param {Number} code 
 * @param {String} message 
 * @param {Function} next 
 * @returns 
 */
export const throwError = (code = 401, message = 'Unauthentcated' , next) => {
  let err = {};
  err.status = code;
  err.message = message;
  return next(err);
}