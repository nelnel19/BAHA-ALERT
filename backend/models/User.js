// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    fullname: String,
    email: { type: String, unique: true },
    password: String,
    age: Number,
    profileImage: { type: String, default: "" },
    role: { type: String, default: "user" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);