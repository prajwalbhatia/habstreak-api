import RazorPay from 'razorpay';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
dotenv.config();

import shortid from 'shortid';
import crypto from 'crypto';

const razorPayData = new RazorPay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});


export const razorPay = asyncHandler(async (req, res, next) => {
  const amount = 90;
  const currency = 'INR';

  const options = {
    amount: (amount * 100).toString(),
    currency: currency,
    receipt: shortid.generate(),
    payment: {
      capture: "automatic",
      capture_options: {
        "automatic_expiry_period ": 12,
        "manual_expiry_period ": 7200,
        "refund_speed": "optimum"
      }
    }
  }

  try {
    const response = await razorPayData.orders.create(options);
    console.log('🚀 ~ file: razorPay.js ~ line 29 ~ razorPay ~ response', response);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount
    });
  } catch (error) {
    console.log('RAZORPAY', error)
  }
})

export const verification = asyncHandler(async (req , res , next) => {
  const secret = process.env.VERIFICATION_SECRET;

  const shasum = crypto.createHmac('sha256' , secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  console.log('digest' , digest , req.headers['x-razorpay-signature']);

  if (digest === req.headers['x-razorpay-signature'])
  {
    console.log('REQUEST IS LEGIT')
    
    res.json({status : 'ok'})
  }
  else
  {
    //PASS IT
    res.status(502);
  }
  console.log(req.body)
})