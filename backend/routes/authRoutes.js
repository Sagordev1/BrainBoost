const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/signup  (replaces signup.php)
router.post("/signup", async (req, res) => {
  const { username, email, password, schoolCollege, className } = req.body;

  const u = (username || "").trim();
  const e = (email || "").trim();
  const p = password || "";
  const sc = (schoolCollege || "").trim();
  const cn = (className || "").trim();

  if (!u || !e || !p || !sc || !cn) {
    return res.json({ success: false, message: "সব ফিল্ড পূরণ করো।" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(e)) {
    return res.json({ success: false, message: "সঠিক ইমেইল দাও।" });
  }

  if (p.length < 6) {
    return res.json({ success: false, message: "পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে।" });
  }

  try {
    const existing = await User.findOne({ $or: [{ username: u }, { email: e }] });
    if (existing) {
      return res.json({ success: false, message: "এই Username অথবা Email আগে থেকেই ব্যবহৃত হয়েছে।" });
    }

    const hashedPassword = await bcrypt.hash(p, 10);
    const user = await User.create({
      username: u,
      email: e,
      password: hashedPassword,
      schoolCollege: sc,
      className: cn,
    });

    const token = signToken(user._id);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({ success: true, message: "Account তৈরি হয়েছে!" });
  } catch (err) {
    res.json({ success: false, message: "কিছু একটা ভুল হয়েছে, আবার চেষ্টা করো।" });
  }
});

// POST /api/auth/login  (replaces login.php)
router.post("/login", async (req, res) => {
  const username = (req.body.username || "").trim();
  const password = req.body.password || "";

  if (!username || !password) {
    return res.json({ success: false, message: "Username এবং Password দাও।" });
  }

  const user = await User.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = signToken(user._id);
    res.cookie("token", token, COOKIE_OPTIONS);
    return res.json({ success: true, message: "Login successful!" });
  }

  res.json({ success: false, message: "Username অথবা Password ভুল।" });
});

// POST /api/auth/logout  (replaces logout.php)
router.post("/logout", (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ success: true });
});

// GET /api/auth/me  (replaces the session-lookup block at the top of account.php)
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.clearCookie("token", COOKIE_OPTIONS);
    return res.json({ loggedIn: false });
  }
  res.json({ loggedIn: true, user });
});

// PUT /api/auth/profile  (replaces update_profile.php)
router.put("/profile", requireAuth, async (req, res) => {
  const allowedFields = ["schoolCollege", "className"];
  const { field, value } = req.body;
  const v = (value || "").trim();

  if (!allowedFields.includes(field)) {
    return res.json({ success: false, message: "এই field edit করা যাবে না।" });
  }
  if (v === "") {
    return res.json({ success: false, message: "খালি রাখা যাবে না।" });
  }

  await User.findByIdAndUpdate(req.user.id, { [field]: v });
  res.json({ success: true, message: "Updated!", value: v });
});

module.exports = router;
