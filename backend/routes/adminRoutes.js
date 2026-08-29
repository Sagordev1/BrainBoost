const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const QuizSettings = require("../models/QuizSettings");
const QuizQuestion = require("../models/QuizQuestion");
const { requireAdmin } = require("../middleware/adminAuth");

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 2 * 60 * 60 * 1000, // 2 hours
};



const loginAttempts = new Map(); 

function getAttemptState(ip) {
  if (!loginAttempts.has(ip)) loginAttempts.set(ip, { attempts: 0, lockoutUntil: 0 });
  return loginAttempts.get(ip);
}

// POST /api/admin/login  (replaces the POST handling in admin.php)
router.post("/login", async (req, res) => {
  const ip = req.ip;
  const state = getAttemptState(ip);

  if (Date.now() < state.lockoutUntil) {
    return res.json({ status: "error", message: "অনেকবার ভুল Password দিয়েছ। কিছুক্ষণ পর আবার চেষ্টা করো।" });
  }

  const { password } = req.body;
  const isMatch = await bcrypt.compare(password || "", process.env.ADMIN_PASSWORD_HASH || "");

  if (isMatch) {
    state.attempts = 0;
    const token = jwt.sign({ admin: true }, process.env.ADMIN_JWT_SECRET, { expiresIn: "2h" });
    res.cookie("adminToken", token, COOKIE_OPTIONS);
    return res.json({ status: "success" });
  }

  state.attempts++;
  if (state.attempts >= 5) {
    state.lockoutUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
    return res.json({ status: "error", message: "অনেকবার ভুল Password দিয়েছ। ৫ মিনিট পর আবার চেষ্টা করো।" });
  }

  res.json({ status: "error", message: "Wrong Password!" });
});

// POST /api/admin/logout  (replaces admin.php?logout=1)
router.post("/logout", (req, res) => {
  res.clearCookie("adminToken", COOKIE_OPTIONS);
  res.json({ status: "success" });
});

// GET /api/admin/status  (lets the React app know if the admin cookie is still valid)
router.get("/status", requireAdmin, (req, res) => {
  res.json({ isAdmin: true });
});

// GET /api/admin/settings  (replaces the quiz_settings SELECT in admin.php)
router.get("/settings", requireAdmin, async (req, res) => {
  const settings = await QuizSettings.findOne({ quizKey: "recent_phage" });
  res.json({
    startTime: settings?.startTime || null,
    activeChapter: settings?.activeChapter || "",
    durationMinutes: settings?.durationMinutes || 10,
  });
});

// POST /api/admin/exam-time  (replaces save_exam_time.php)
router.post("/exam-time", requireAdmin, async (req, res) => {
  const { start_time: startTime } = req.body;

  if (!startTime) {
    return res.json({ status: "error", message: "সঠিক সময় পাওয়া যায়নি!" });
  }

  try {
    await QuizSettings.findOneAndUpdate(
      { quizKey: "recent_phage" },
      { startTime: new Date(startTime) },
      { upsert: true }
    );
    res.json({ status: "success", message: "Exam time সেভ হয়ে গেছে!" });
  } catch (err) {
    res.json({ status: "error", message: "DB Error: " + err.message });
  }
});

// POST /api/admin/chapter  (replaces save_chapter.php)
router.post("/chapter", requireAdmin, async (req, res) => {
  let chapter = (req.body.chapter || "").trim();
  chapter = chapter.replace(/[^a-zA-Z0-9_()-]/g, "");

  let duration = parseInt(req.body.duration, 10);
  if (!duration || duration <= 0) duration = 10;

  await QuizSettings.findOneAndUpdate(
    { quizKey: "recent_phage" },
    { activeChapter: chapter, durationMinutes: duration },
    { upsert: true }
  );

  if (chapter === "") {
    res.json({ status: "success", message: "Active Chapter খালি করা হয়েছে — এখন কোনো quiz active নেই।" });
  } else {
    res.json({ status: "success", message: `Chapter এবং সময় (${duration} মিনিট) সেভ হয়ে গেছে!` });
  }
});

// GET /api/admin/questions  (replaces the quiz_questions SELECT in admin.php)
router.get("/questions", requireAdmin, async (req, res) => {
  const questions = await QuizQuestion.find().sort({ quizKey: 1, sortOrder: 1 });
  res.json({ questions });
});

// POST /api/admin/questions  (replaces save_question.php)
router.post("/questions", requireAdmin, async (req, res) => {
  let chapter = (req.body.chapter || "").trim();
  chapter = chapter.replace(/[^a-zA-Z0-9_()-]/g, "");
  const question = (req.body.question || "").trim();
  const option1 = (req.body.option1 || "").trim();
  const option2 = (req.body.option2 || "").trim();
  const option3 = (req.body.option3 || "").trim();
  const option4 = (req.body.option4 || "").trim();
  const correct = (req.body.correct || "").trim();

  if (!chapter || !question || !option1 || !option2 || !option3 || !option4 || !correct) {
    return res.json({ status: "error", message: "সব ফিল্ড পূরণ করো।" });
  }

  const validOptions = [option1, option2, option3, option4];
  if (!validOptions.includes(correct)) {
    return res.json({ status: "error", message: "সঠিক answer অবশ্যই ৪টা option এর একটার সাথে হুবহু মিলতে হবে।" });
  }

  const count = await QuizQuestion.countDocuments({ quizKey: chapter });

  await QuizQuestion.create({
    quizKey: chapter,
    question,
    option1,
    option2,
    option3,
    option4,
    correctAnswer: correct,
    sortOrder: count + 1,
  });

  res.json({ status: "success", message: "প্রশ্ন যোগ হয়ে গেছে!" });
});

// DELETE /api/admin/questions/:id  (replaces delete_question.php)
router.delete("/questions/:id", requireAdmin, async (req, res) => {
  try {
    await QuizQuestion.findByIdAndDelete(req.params.id);
    res.json({ status: "success", message: "প্রশ্ন মুছে ফেলা হয়েছে!" });
  } catch (err) {
    res.json({ status: "error", message: "Invalid ID." });
  }
});

module.exports = router;
