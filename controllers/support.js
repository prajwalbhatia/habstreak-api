import asyncHandler from 'express-async-handler';
import { mailTrasport, otpTemplate, throwError } from '../utils.js';

let err = {};

export const writeMessage = asyncHandler(async (req, res, next) => {
  const { message, email } = req.body;

  if (!message || !email) throwError(400, 'Invalid request, missing parameters!', next);

  mailTrasport().sendMail({
    from: '"Habstreak" <support@habstreak.com>',
    to: 'support@habstreak.com',
    subject: `Query by ${email}`,
    text: message
  })

  res.status(200).json({ message: 'Your message is send' });

})
