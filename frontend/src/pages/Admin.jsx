import { useEffect, useState } from "react";
import api from "../api";
import "./Admin.css";

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(null); // null = checking

  useEffect(() => {
    api
      .get("/admin/status")
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === null) return null;

  return (
    <section className="account">
      {isAdmin ? <AdminPanel onLogout={() => setIsAdmin(false)} /> : <AdminLogin onSuccess={() => setIsAdmin(true)} />}
    </section>
  );
}

function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await api.post("/admin/login", { password });
    if (res.data.status === "success") {
      onSuccess();
    } else {
      setError(res.data.message || "Wrong Password!");
    }
  }

  return (
    <div className="form-box">
      <h2>Admin Login</h2>
      {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Admin Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function AdminPanel({ onLogout }) {
  const [settings, setSettings] = useState({ startTime: "", activeChapter: "", durationMinutes: 10 });
  const [questions, setQuestions] = useState([]);
  const [statusMsg, setStatusMsg] = useState({ text: "", color: "" });
  const [chapterMsg, setChapterMsg] = useState({ text: "", color: "" });
  const [questionMsg, setQuestionMsg] = useState({ text: "", color: "" });

  const [startTimeInput, setStartTimeInput] = useState("");
  const [chapterInput, setChapterInput] = useState("");
  const [durationInput, setDurationInput] = useState(10);
  const [qForm, setQForm] = useState({
    chapter: "", question: "", option1: "", option2: "", option3: "", option4: "", correct: "",
  });

  async function loadAll() {
    const [settingsRes, questionsRes] = await Promise.all([
      api.get("/admin/settings"),
      api.get("/admin/questions"),
    ]);
    setSettings(settingsRes.data);
    setQuestions(questionsRes.data.questions);
    setChapterInput(settingsRes.data.activeChapter || "");
    setDurationInput(settingsRes.data.durationMinutes || 10);
    setQForm((f) => ({ ...f, chapter: settingsRes.data.activeChapter || "" }));
    if (settingsRes.data.startTime) {
      // format for <input type="datetime-local">
      const d = new Date(settingsRes.data.startTime);
      const pad = (n) => String(n).padStart(2, "0");
      setStartTimeInput(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleLogout() {
    await api.post("/admin/logout");
    onLogout();
  }

  async function handleSaveExamTime(e) {
    e.preventDefault();
    setStatusMsg({ text: "সেভ হচ্ছে...", color: "#ffb703" });
    const res = await api.post("/admin/exam-time", { start_time: startTimeInput });
    if (res.data.status === "success") {
      setStatusMsg({ text: res.data.message, color: "limegreen" });
    } else {
      setStatusMsg({ text: res.data.message || "ত্রুটি হয়েছে!", color: "#ff6b6b" });
    }
  }

  async function handleSaveChapter() {
    setChapterMsg({ text: "সেভ হচ্ছে...", color: "#ffb703" });
    const res = await api.post("/admin/chapter", {
      chapter: chapterInput.trim(),
      duration: durationInput,
    });
    if (res.data.status === "success") {
      setChapterMsg({ text: res.data.message, color: "limegreen" });
      setQForm((f) => ({ ...f, chapter: chapterInput.trim() }));
    } else {
      setChapterMsg({ text: res.data.message || "ত্রুটি হয়েছে!", color: "#ff6b6b" });
    }
  }

  async function handleAddQuestion(e) {
    e.preventDefault();
    setQuestionMsg({ text: "সেভ হচ্ছে...", color: "#ffb703" });
    const res = await api.post("/admin/questions", qForm);
    if (res.data.status === "success") {
      setQuestionMsg({ text: res.data.message, color: "limegreen" });
      setTimeout(loadAll, 400);
    } else {
      setQuestionMsg({ text: res.data.message, color: "#ff6b6b" });
    }
  }

  async function handleDelete(id) {
    if (!confirm("এই প্রশ্নটা মুছে ফেলতে চাও?")) return;
    const res = await api.delete(`/admin/questions/${id}`);
    if (res.data.status === "success") {
      loadAll();
    } else {
      alert(res.data.message);
    }
  }

  const grouped = questions.reduce((acc, q) => {
    (acc[q.quizKey] = acc[q.quizKey] || []).push(q);
    return acc;
  }, {});

  return (
    <div className="form-box" style={{ maxWidth: 700 }}>
      <h2>Recent Phage - Exam Time</h2>
      <p style={{ marginBottom: 15, fontSize: 14, fontWeight: "bold", color: statusMsg.color }}>{statusMsg.text}</p>

      <form onSubmit={handleSaveExamTime}>
        <label style={{ color: "white", display: "block", marginBottom: 5 }}>Start Time:</label>
        <input
          type="datetime-local"
          value={startTimeInput}
          onChange={(e) => setStartTimeInput(e.target.value)}
          required
        />
        <button type="submit" style={{ marginTop: 15 }}>Save Time</button>
      </form>

      <hr style={{ margin: "20px 0", borderColor: "#00abf0" }} />

      <label style={{ color: "white", display: "block", marginBottom: 5 }}>Active Chapter Code:</label>
      <input
        type="text"
        value={chapterInput}
        onChange={(e) => setChapterInput(e.target.value)}
        placeholder="chapter1"
      />

      <label style={{ color: "white", display: "block", marginTop: 15, marginBottom: 5 }}>Quiz Duration (minutes):</label>
      <input
        type="number"
        min="1"
        value={durationInput}
        onChange={(e) => setDurationInput(e.target.value)}
        placeholder="10"
      />

      <button type="button" style={{ marginTop: 15 }} onClick={handleSaveChapter}>Save Chapter</button>
      <p style={{ marginTop: 10, fontSize: 14, fontWeight: "bold", color: chapterMsg.color }}>{chapterMsg.text}</p>

      <hr style={{ margin: "30px 0", borderColor: "#00abf0" }} />

      <h3 style={{ color: "white", marginBottom: 15 }}>\u09a8\u09a4\u09c1\u09a8 \u09aa\u09cd\u09b0\u09b6\u09cd\u09a8 \u09af\u09cb\u0997 \u0995\u09b0\u09cb</h3>

      <form onSubmit={handleAddQuestion}>
        <label style={{ color: "white", display: "block", marginBottom: 5 }}>Chapter Code:</label>
        <input
          type="text"
          placeholder="chapter1"
          required
          style={{ marginBottom: 10 }}
          value={qForm.chapter}
          onChange={(e) => setQForm({ ...qForm, chapter: e.target.value })}
        />

        <label style={{ color: "white", display: "block", marginBottom: 5 }}>\u09aa\u09cd\u09b0\u09b6\u09cd\u09a8:</label>
        <input
          type="text"
          placeholder="\u09aa\u09cd\u09b0\u09b6\u09cd\u09a8 \u09b2\u09c7\u0996\u09cb"
          required
          style={{ marginBottom: 10 }}
          value={qForm.question}
          onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
        />

        {[1, 2, 3, 4].map((n) => (
          <div key={n}>
            <label style={{ color: "white", display: "block", marginBottom: 5 }}>Option {n}:</label>
            <input
              type="text"
              required
              style={{ marginBottom: 10 }}
              value={qForm[`option${n}`]}
              onChange={(e) => setQForm({ ...qForm, [`option${n}`]: e.target.value })}
            />
          </div>
        ))}

        <label style={{ color: "white", display: "block", marginBottom: 5 }}>
          \u09b8\u0983\u0996 Answer (\u0989\u09aa\u09b0\u09c7\u09b0 \u09aa4\u099f\u09be\u09b0 \u098f\u0995\u099f\u09be \u09b9\u09c1\u09ac\u09b9\u09c1 \u0995\u09aa\u09bf \u0995\u09b0\u09cb):
        </label>
        <input
          type="text"
          required
          style={{ marginBottom: 10 }}
          value={qForm.correct}
          onChange={(e) => setQForm({ ...qForm, correct: e.target.value })}
        />

        <button type="submit">\u09aa\u09cd\u09b0\u09b6\u09cd\u09a8 \u09af\u09cb\u0997 \u0995\u09b0\u09cb</button>
        <p style={{ marginTop: 10, fontSize: 14, fontWeight: "bold", color: questionMsg.color }}>{questionMsg.text}</p>
      </form>

      <hr style={{ margin: "30px 0", borderColor: "#00abf0" }} />

      <h3 style={{ color: "white", marginBottom: 15 }}>\u09b8\u09ac \u09aa\u09cd\u09b0\u09b6\u09cd\u09a8 (Chapter \u0985\u09a8\u09c1\u09af\u09be\u09df\u09c0)</h3>

      <div style={{ textAlign: "left", maxHeight: 400, overflowY: "auto" }}>
        {Object.entries(grouped).map(([chapKey, qs]) => (
          <div key={chapKey}>
            <h4 style={{ color: "#00abf0", marginTop: 15 }}>{chapKey}</h4>
            {qs.map((q) => (
              <div key={q._id} style={{ background: "#081b29", padding: 10, borderRadius: 8, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#ddd", fontSize: 14 }}>
                  {q.question}
                  <br /><small style={{ color: "#0f0" }}>\u09b8\u0983\u0996: {q.correctAnswer}</small>
                </span>
                <button
                  type="button"
                  style={{ background: "#e74c3c", color: "white", padding: "6px 12px", fontSize: 12 }}
                  onClick={() => handleDelete(q._id)}
                >
                  \u09ae\u09c1\u099b\u09cb
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="switch" style={{ marginTop: 20 }}>
        <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
      </p>
    </div>
  );
}
