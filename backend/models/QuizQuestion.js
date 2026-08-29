const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema({
  quizKey: { type: String, required: true, index: true },
  question: { type: String, required: true },
  option1: { type: String, required: true },
  option2: { type: String, required: true },
  option3: { type: String, required: true },
  option4: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
});

module.exports = mongoose.model("QuizQuestion", quizQuestionSchema);
