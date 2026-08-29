const express = require("express");
const ContactMessage = require("../models/ContactMessage");

const router = express.Router();

// POST /api/contact  (replaces save_contact.php)
router.post("/", async (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim();
  const message = (req.body.message || "").trim();

  if (!name || !email || !message) {
    return res.json({ success: false, message: "সব ফিল্ড পূরণ করো।" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({ success: false, message: "সঠিক email দাও।" });
  }

  await ContactMessage.create({ name, email, message });
  res.json({ success: true, message: "তোমার মেসেজ পাঠানো হয়েছে, ধন্যবাদ!" });
});

module.exports = router;
