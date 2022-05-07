import mongoose from 'mongoose';

const UserScema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    // required: true
  },
  fromGoogle: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  verified : {
    type : Boolean,
    default : false,
    required : true
  },
  id: { type: String },
  planType: { type: String, default: "free" },
  orderId: { type: String, default: "" },
  paymentId: { type: String, default: "" }
});

const User = mongoose.model('User', UserScema);

export default User;