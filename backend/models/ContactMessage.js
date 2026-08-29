const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports =  mongoose.model("ContactMessage", contactMessageSchema);
