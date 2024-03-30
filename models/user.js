import mongoose from "mongoose";

const UserScema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    // required: true
  },
  fromGoogle: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  id: { type: String },
  planType: { type: String, default: "free" },
  orderId: { type: String, default: "" },
  paymentId: { type: String, default: "" },
  startTime: { type: String, default: "" },
  endTime: { type: String, default: "" },
  otpEnabled: { type: Boolean, default: false },
  otpVerified: { type: Boolean, default: false },
  otpAscii: { type: String, default: "" },
  otpHex: { type: String, default: "" },
  otpBase32: { type: String, default: "" },
  otpAuthUrl: { type: String, default: "" },
});

const User = mongoose.model("User", UserScema);

export default User;
