const mongoose = require("mongoose");

// One document per quizKey (e.g. "recent_phage"), mirrors the quiz_settings table
const quizSettingsSchema = new mongoose.Schema({
  quizKey: { type: String, required: true, unique: true, default: "recent_phage" },
  startTime: { type: Date, default: null },
  activeChapter: { type: String, default: "" },
  durationMinutes: { type: Number, default: 10 },
});

module.exports = mongoose.model("QuizSettings", quizSettingsSchema);
