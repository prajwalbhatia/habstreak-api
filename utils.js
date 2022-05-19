import nodemailer from 'nodemailer';

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
export const throwError = (code = 401, message = 'Unauthentcated', next) => {
  let err = {};
  err.status = code;
  err.message = message;
  return next ?  next(err) : err;
}

/**
 * 
 * @returns Four digit OTP as a string
 */
export const generateOtp = () => {
  let otp = ''
  for (let i = 0; i <= 3; i++) {
    let random = Math.round(Math.random() * 9);
    otp += random;
  }
  return otp;
}

export const mailTrasport = () => {
  let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD
    }
  });
  return transport;
}

export const otpTemplate = (otp) => {
  return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">HABSTREAK</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Habstreak. Use the following OTP to complete your Sign Up procedures. OTP is valid for 1 hour</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />Habstreak</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>HABSTREAK</p>
    </div>
  </div>
</div>`
}

export const welcomeTemplate = (otp) => {
  return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">HABSTREAK</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Habstreak. Use the following OTP to complete your Sign Up procedures. OTP is valid for 1 hour</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />Habstreak</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>HABSTREAK</p>
    </div>
  </div>
</div>`
}