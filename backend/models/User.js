const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true }, // bcrypt hash
    schoolCollege: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);


module.exports = mongoose.model("User", userSchema);
