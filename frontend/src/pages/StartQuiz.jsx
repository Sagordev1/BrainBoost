import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import api from "../api";
import "./StartQuiz.css";

const STATIC_TOPICS = [
  { title: "HTML", desc: "Test your HTML fundamentals." },
  { title: "CSS", desc: "Practice layouts, Flexbox and Grid." },
  { title: "JavaScript", desc: "Improve your JS programming skills." },
  { title: "Java", desc: "Object-Oriented Programming concepts." },
  { title: "C++", desc: "Data Structures and Algorithms." },
];

export default function StartQuiz() {
  const [chapterLabel, setChapterLabel] = useState("Loading...");
  const [remaining, setRemaining] = useState(0);
  const [hasChapter, setHasChapter] = useState(true);
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    api
      .get("/quiz/exam-time")
      .then((res) => {
        const data = res.data;
        const chapterExists = data.chapter && data.chapter.trim() !== "";
        setHasChapter(chapterExists);

        if (!chapterExists) {
          setChapterLabel("Quiz are coming....");
          return;
        }

        setChapterLabel(data.chapter);
        setLocked(data.locked);
        setRemaining(data.secondsRemaining);
      })
      .catch(() => {
        setChapterLabel("Quiz are coming....");
        setHasChapter(false);
      });
  }, []);

  useEffect(() => {
    if (!locked || !hasChapter) return;
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [locked, hasChapter, remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const ready = hasChapter && (!locked || remaining <= 0);

  return (
    <>
      <Header />
      <section className="quiz">
        <h2>Choose a Quiz</h2>
        <p className="subtitle">Select a topic to start your learning journey.</p>

        <div className="container">
          {STATIC_TOPICS.map((topic) => (
            <div className="card" key={topic.title}>
              <h3>{topic.title}</h3>
              <p>{topic.desc}</p>
              <button>Start Quiz</button>
            </div>
          ))}

          <div className="card">
            <h3>Recent Phage</h3>
            <p id="chapterLabel">{chapterLabel}</p>

            {hasChapter && (
              ready ? (
                <Link to="/recentphage">
                  <button>Start Quiz</button>
                </Link>
              ) : (
                <h4 id="timerBox">
                  You will be able to start the quiz after: {minutes}m {String(seconds).padStart(2, "0")}s
                </h4>
              )
            )}
          </div>
        </div>
      </section>
    </>
  );




  
}
