import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 50,
      required: false,
    },
    username: {
      type: String,
      minlength: 2,
      maxlength: 50,
      required: false,
    },
    password: {
      type: String, // for guest login
      minlength: 6, // optional, can adjust
      maxlength: 100, // optional
      required: false,
    },
    googleId: {
      type: String, // for Google login
      required: false,
    },
    email: {
      type: String, // optional for Google login
      lowercase: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
      required: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
