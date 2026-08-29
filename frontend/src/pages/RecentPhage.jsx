import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import api from "../api";
import "./RecentPhage.css";

export default function RecentPhage() {
  const [phase, setPhase] = useState("loading"); // loading | already | waiting | quiz
  const [quizKey, setQuizKey] = useState("");
  const [duration, setDuration] = useState(10);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    api.get("/quiz/recent-phage").then((res) => {
      const data = res.data;
      setQuizKey(data.quizKey);
      setDuration(data.duration);

      if (data.existingAttempt) {
        setExistingAttempt(data.existingAttempt);
        setPhase("already");
      } else if (data.notStartedYet) {
        setCountdown(data.secondsRemaining);
        setPhase("waiting");
      } else {
        setPhase("quiz");
      }
    });
  }, []);

  useEffect(() => {
    if (phase !== "waiting") return;
    if (countdown <= 0) {
      setPhase("quiz");
      return;
    }
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [phase, countdown]);

  return (
    <>
      <Header />
      <div className="container">
        {phase === "loading" && null}

        {phase === "already" && (
          <>
            <h1>{quizKey}</h1>
            <h2>You have already given this quiz!</h2>
            <h2 id="score">Your Score : {existingAttempt.score} / {existingAttempt.totalQuestions}</h2>
            <p style={{ marginTop: 15, color: "#b8b8b8" }}>Go to Dashboard to see the full result.</p>
            <Link to="/dashboard">
              <button style={{ marginTop: 15, background: "#00b4fc", color: "#081b29", fontWeight: "bold", fontSize: 16, padding: "12px 30px", border: "none", borderRadius: 8, cursor: "pointer" }}>
                Go to Dashboard
              </button>
            </Link>
          </>
        )}

        {phase === "waiting" && <WaitingCountdown quizKey={quizKey} seconds={countdown} />}

        {phase === "quiz" && <QuizRunner quizKey={quizKey} durationMinutes={duration} />}
      </div>
    </>
  );
}

function WaitingCountdown({ quizKey, seconds }) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  let display = "";
  if (hours > 0) display += hours + "h ";
  display += mins + "m " + (secs < 10 ? "0" : "") + secs + "s";

  return (
    <>
      <h1>{quizKey}</h1>
      <h2>Quiz starts in:</h2>
      <h1 id="timer" style={{ color: "#ffb703", fontSize: 38, margin: "20px 0" }}>
        {seconds <= 0 ? "Time's up! Loading questions..." : display}
      </h1>
    </>
  );
}

function QuizRunner({ quizKey, durationMinutes }) {
  const [quiz, setQuiz] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [userAnswers, setUserAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [finished, setFinished] = useState(false);
  const [finalAnswers, setFinalAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const autoSubmittedRef = useRef(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    api
      .get(`/quiz/questions/${encodeURIComponent(quizKey)}`)
      .then((res) => {
        if (!res.data.success) {
          setLoadError(res.data.message || "প্রশ্ন লোড করা যায়নি।");
          return;
        }
        setQuiz(res.data.questions);
      })
      .catch(() => setLoadError("সার্ভারে সমস্যা হয়েছে।"));
  }, [quizKey]);

  useEffect(() => {
    if (finished || quiz.length === 0) return;
    if (secondsLeft <= 0) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        alert("সময় শেষ! যা উত্তর দিয়েছ তাই দিয়ে অটোমেটিক সাবমিট হয়ে যাচ্ছে।");
        finishQuiz();
      }
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, finished, quiz]);

  function selectAnswer(qIndex, optText) {
    setUserAnswers((prev) => ({ ...prev, [qIndex]: optText }));
  }

  function handleSubmitClick() {
    if (Object.keys(userAnswers).length < quiz.length) {
      if (!confirm("সব প্রশ্নের উত্তর দাওনি! এখনই সাবমিট করতে চাও?")) return;
    }
    finishQuiz();
  }

  function finishQuiz() {
    const answers = [];
    let s = 0;

    quiz.forEach((q, index) => {
      const selected = userAnswers[index] || "";
      const isCorrect = selected === q.answer;
      if (isCorrect) s++;
      answers.push({
        question: q.question,
        selected: selected || "উত্তর দেওয়া হয়নি",
        correct: q.answer,
        isCorrect,
      });
    });

    setScore(s);
    setFinalAnswers(answers);
    setFinished(true);

    if (s === quiz.length || s >= quiz.length - 2) {
      launchConfetti(canvasRef.current, 150);
    } else if (s > quiz.length / 2) {
      launchConfetti(canvasRef.current, 60);
    }

    api
      .post("/quiz/result", {
        quiz_key: quizKey,
        score: s,
        total: quiz.length,
        answers,
      })
      .catch(() => console.log("রেজাল্ট সেভ করতে সমস্যা হয়েছে।"));
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  if (loadError) {
    return <p>{loadError}</p>;
  }

  if (quiz.length === 0) {
    return null;
  }

  if (!finished) {
    return (
      <>
        <div id="quizStickyHeader">
          <h1>{quizKey}</h1>
          <h2 id="quizTimer" style={secondsLeft <= 30 ? { color: "#e74c3c" } : undefined}>
            Time Left: {mins}m {String(secs).padStart(2, "0")}s
          </h2>
        </div>

        <div id="quizBox">
          <div id="questionsContainer">
            {quiz.map((q, qIndex) => (
              <div className="question-block" key={qIndex}>
                <h3 className="question-title">{qIndex + 1}. {q.question}</h3>
                <div className="options" id={`options-${qIndex}`}>
                  {q.options.map((optText) => (
                    <button
                      key={optText}
                      type="button"
                      className="option"
                      style={{ background: userAnswers[qIndex] === optText ? "green" : "#3498db" }}
                      onClick={() => selectAnswer(qIndex, optText)}
                    >
                      {optText}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button id="submitBtn" onClick={handleSubmitClick}>Submit</button>
        </div>
      </>
    );
  }

  const legendary = score === quiz.length || score >= quiz.length - 2;
  const good = !legendary && score > quiz.length / 2;

  return (
    <>
      <div id="resultBox">
        <h2 id="resultTitle" style={{ marginBottom: 8, color: legendary ? "#ffd700" : good ? "#00abf0" : "#ff6b6b" }}>
          {legendary ? "Congratulations, Legendary Performance \uD83D\uDC10" : good ? "Owhhh, Good Performance\u26A1" : "Low Performance \uD83D\uDE22"}
        </h2>
        <p id="resultSubtitle" style={{ marginBottom: 15, fontSize: legendary || good ? 16 : 13, color: legendary || good ? "#ddd" : "#8a8a8a", lineHeight: 1.6 }}>
          {legendary
            ? "Keep Crushing It!"
            : good
              ? "Keep Improving! \uD83D\uDCC8"
              : (<>Failure is an important things<br />because success doesn't always teach you much <br />it just boosts your ego(keep pushing)</>)}
        </p>
        <h2 id="score">Your Score : {score} / {quiz.length}</h2>
        {!showReview && <button id="seeResultBtn" onClick={() => setShowReview(true)}>See Result</button>}
      </div>

      <canvas
        ref={canvasRef}
        id="confettiCanvas"
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999 }}
      />

      {showReview && (
        <div id="reviewContainer">
          {finalAnswers.map((item, index) => (
            <div className={`review-item ${item.isCorrect ? "correct" : "wrong"}`} key={index}>
              <p className="review-question">{index + 1}. {item.question}</p>
              <p className="review-answer">Your Answer: <span>{item.selected}</span></p>
              {!item.isCorrect && (
                <p className="review-answer">Correct Answer: <span>{item.correct}</span></p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function launchConfetti(canvas, particleCount) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#ffd700", "#00abf0", "#ff6b6b", "#4CAF50", "#e74c3c", "#ffffff"];
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5,
    });
  }

  let frame = 0;
  const maxFrames = 240;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    frame++;
    if (frame < maxFrames) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}
