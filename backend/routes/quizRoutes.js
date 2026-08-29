const express = require("express");
const QuizQuestion = require("../models/QuizQuestion");
const QuizAttempt = require("../models/QuizAttempt");
const QuizSettings = require("../models/QuizSettings");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/quiz/exam-time  (replaces check_exam_time.php - public)
router.get("/exam-time", async (req, res) => {
  const settings = await QuizSettings.findOne({ quizKey: "recent_phage" });

  if (!settings || !settings.startTime) {
    return res.json({ locked: true, secondsRemaining: 0, startTime: null, chapter: settings?.activeChapter || "" });
  }

  const secondsRemaining = Math.floor((settings.startTime.getTime() - Date.now()) / 1000);

  res.json({
    locked: secondsRemaining > 0,
    secondsRemaining: Math.max(0, secondsRemaining),
    startTime: settings.startTime,
    chapter: settings.activeChapter || "",
  });
});

// GET /api/quiz/recent-phage  (replaces the data-gathering block in recentphage.php)
router.get("/recent-phage", requireAuth, async (req, res) => {
  const settings = await QuizSettings.findOne({ quizKey: "recent_phage" });
  const quizKey = settings?.activeChapter || "chapter1";
  const duration = settings?.durationMinutes || 10;

  const existingAttempt = await QuizAttempt.findOne({ user: req.user.id, quizKey });

  const now = Date.now();
  const startTimestamp = settings?.startTime ? settings.startTime.getTime() : 0;
  const secondsRemaining = Math.floor((startTimestamp - now) / 1000);
  const notStartedYet = secondsRemaining > 0;

  res.json({
    quizKey,
    duration,
    notStartedYet,
    secondsRemaining: Math.max(0, secondsRemaining),
    existingAttempt: existingAttempt
      ? { score: existingAttempt.score, totalQuestions: existingAttempt.totalQuestions }
      : null,
  });
});

// GET /api/quiz/questions/:code  (replaces get_quiz_questions.php)
router.get("/questions/:code", requireAuth, async (req, res) => {
  const quizKey = req.params.code || "";

  if (!quizKey) {
    return res.json({ success: false, message: "quiz code পাওয়া যায়নি।" });
  }

  const rows = await QuizQuestion.find({ quizKey }).sort({ sortOrder: 1, _id: 1 });

  if (rows.length === 0) {
    return res.json({ success: false, message: "এই quiz এর কোনো প্রশ্ন পাওয়া যায়নি।" });
  }

  const questions = rows.map((row) => ({
    question: row.question,
    options: [row.option1, row.option2, row.option3, row.option4],
    answer: row.correctAnswer,
  }));

  res.json({ success: true, questions });
});

// POST /api/quiz/result  (replaces save_quiz_result.php)
router.post("/result", requireAuth, async (req, res) => {
  const { quiz_key: quizKey, score, total, answers } = req.body;

  if (!quizKey) {
    return res.json({ success: false, message: "quiz_key পাওয়া যায়নি।" });
  }

  try {
    await QuizAttempt.create({
      user: req.user.id,
      quizKey,
      score: score || 0,
      totalQuestions: total || 0,
      answers: answers || [],
    });
    res.json({ success: true, message: "রেজাল্ট সেভ হয়েছে।" });
  } catch (err) {
    // duplicate key error -> the unique (user, quizKey) index already has an attempt
    res.json({ success: false, message: "This quiz already has given by you" });
  }
});

// GET /api/quiz/attempts  (replaces the Dashboard.php data query)
router.get("/attempts", requireAuth, async (req, res) => {
  const attempts = await QuizAttempt.find({ user: req.user.id }).sort({ submittedAt: -1 });
  res.json({ success: true, attempts });
});


module.exports = router;
