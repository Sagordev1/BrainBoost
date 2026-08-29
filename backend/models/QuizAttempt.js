const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: String,
    selected: String,
    correct: String,
    isCorrect: Boolean,
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quizKey: { type: String, required: true },
    score: { type: Number, required: true, default: 0 },
    totalQuestions: { type: Number, required: true, default: 0 },
    answers: { type: [answerSchema], default: [] },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);


quizAttemptSchema.index({ user: 1, quizKey: 1 }, { unique: true });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
