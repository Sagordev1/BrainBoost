import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import api from "../api";
import "./Dashboard.css";

export default function Dashboard() {
  const [attempts, setAttempts] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    api.get("/quiz/attempts").then((res) => setAttempts(res.data.attempts || []));
  }, []);

  async function askAi(question) {
    try {
      await navigator.clipboard.writeText(question);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
      window.open("https://claude.ai/new", "claudeAskTab");
    } catch {
      alert("কপি করা যায়নি। ম্যানুয়ালি প্রশ্নটা কপি করো।");
    }
  }

  return (
    <>
      <Header />
      <section className="dashboard">
        {attempts === null ? null : attempts.length === 0 ? (
          <div className="dash-message">
            <h2>You don't start any quiz Yet</h2>
            <Link to="/startquiz"><button>Start a Quiz</button></Link>
          </div>
        ) : (
          <>
            <h2 className="dash-title">Your Quiz History</h2>
            <div className="attempts-list">
              {attempts.map((attempt, i) => (
                <div className="attempt-card" key={attempt._id}>
                  <div className="attempt-header">
                    <h3>{attempt.quizKey}</h3>
                    <span className="attempt-score">{attempt.score} / {attempt.totalQuestions}</span>
                  </div>
                  <p className="attempt-date">
                    Submitted at: {new Date(attempt.submittedAt).toLocaleString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>

                  <button
                    className="toggle-review-btn"
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  >
                    {openIndex === i ? "Hide Review" : "see Review"}
                  </button>

                  {openIndex === i && (
                    <div className="attempt-review">
                      {attempt.answers.map((item, index) => (
                        <div className={`review-item ${item.isCorrect ? "correct" : "wrong"}`} key={index}>
                          <div className="review-question-row">
                            <p className="review-question">{index + 1}. {item.question}</p>
                            <button
                              type="button"
                              className="ask-ai-btn"
                              title="Ask AI about this question"
                              onClick={() => askAi(item.question)}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L14.2 9.2L21.5 11.5L14.2 13.8L12 21L9.8 13.8L2.5 11.5L9.8 9.2L12 2Z" fill="currentColor" />
                              </svg>
                            </button>
                          </div>
                          <p className="review-answer">Your Answer: <span>{item.selected}</span></p>
                          {!item.isCorrect && (
                            <p className="review-answer">Correct Answer: <span>{item.correct}</span></p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <div id="copyToast" className={`copy-toast${toastVisible ? " show" : ""}`}>
        Question copied! Paste (Ctrl+V) in the chat box and hit Enter.
      </div>
    </>
  );
}
