import { useState } from "react";
import Header from "../components/Header";
import api from "../api";
import "./About.css";

export default function About() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [msg, setMsg] = useState({ text: "", color: "" });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ text: "পাঠানো হচ্ছে...", color: "#ffb703" });

    try {
      const res = await api.post("/contact", form);
      if (res.data.success) {
        setMsg({ text: res.data.message, color: "limegreen" });
        setForm({ name: "", email: "", message: "" });
      } else {
        setMsg({ text: res.data.message, color: "#ff6b6b" });
      }
    } catch {
      setMsg({ text: "সার্ভারে সমস্যা হয়েছে।", color: "#ff6b6b" });
    }
  }

  return (
    <>
      <Header />
      <section className="about-section">
        <div className="about-box">
          <h2>About BrainBoost</h2>
          <p>
            BrainBoost is a simple, focused platform built to help learners test and sharpen
            their knowledge through interactive quizzes. Whether you're brushing up on
            programming fundamentals or preparing for an exam, BrainBoost gives you a clean
            space to practice, track your progress, and see exactly where you stand.
          </p>

          <h3>What you'll find here</h3>
          <ul>
            <li>Topic-based quizzes (HTML, CSS, JavaScript, Java, C++ and more)</li>
            <li>Instant scoring with detailed answer review</li>
            <li>A personal dashboard to track every attempt</li>
          </ul>

          <p>Built with the goal of making self-paced learning simple and distraction-free.</p>
        </div>

        <div className="about-box">
          <h2>Contact Us</h2>
          <p id="contactMsg" style={{ marginBottom: 15, fontSize: 14, fontWeight: "bold", color: msg.color }}>
            {msg.text}
          </p>

          <form id="contactForm" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="User name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>

        <p className="credit">This web site is created by <strong>Anto Deb Shuvo</strong></p>
      </section>
    </>
  );
}
