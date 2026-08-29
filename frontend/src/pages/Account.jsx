
import { useState } from "react";
import Header from "../components/Header";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./Account.css";

export default function Account() {
  console.log("ACCOUNT PAGE LOADED");
  const { user, loading, refreshUser, logout } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
  return (
    <>
      <Header />
      <section className="account">
        <div className="form-box">
          <h2>Loading...</h2>
          <p className="switch">Checking account...</p>
        </div>
      </section>
    </>
  );
}
  return (
    <>
      <Header />
      <section className="account">
        {user ? <ProfileBox user={user} logout={logout} refreshUser={refreshUser} /> : (
          showSignup
            ? <SignupBox refreshUser={refreshUser} switchToLogin={() => setShowSignup(false)} />
            : <LoginBox refreshUser={refreshUser} switchToSignup={() => setShowSignup(true)} />
        )}
      </section>
    </>
  );
}

function ProfileBox({ user, logout, refreshUser }) {
  return (
    <div className="form-box" id="profileBox">
      <h2>My Account</h2>

      <p className="greeting">
        Hey, {user.username} — You are in active mode
        <span className="active-badge">✓</span>
      </p>

      <div className="profile-info">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>

        <EditableField
          label="School/College"
          field="schoolCollege"
          value={user.schoolCollege}
          refreshUser={refreshUser}
        />
        <EditableField
          label="Class"
          field="className"
          value={user.className}
          refreshUser={refreshUser}
        />

        <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
      </div>

      <button type="button" onClick={logout}>Logout</button>
    </div>
  );
}

function EditableField({ label, field, value, refreshUser }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value);

  async function handleClick() {
    if (editing) {
      const newValue = input.trim();
      if (newValue === "") {
        alert("খালি রাখা যাবে না।");
        return;
      }
      try {
        const res = await api.put("/auth/profile", { field, value: newValue });
        if (res.data.success) {
          setEditing(false);
          refreshUser();
        } else {
          alert(res.data.message);
        }
      } catch {
        alert("সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করো।");
      }
    } else {
      setInput(value);
      setEditing(true);
    }
  }

  return (
    <p className="editable-field" data-field={field}>
      <strong>{label}:</strong>
      {!editing && <span className="field-value">{value}</span>}
      {editing && (
        <input
          className="field-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
      )}
      <span className="edit-icon" title="Edit" onClick={handleClick}>
        {editing ? "\u2713" : "\u270E"}
      </span>
    </p>
  );
}

function LoginBox({ refreshUser, switchToSignup }) {
  const [form, setForm] = useState({ username: "", password: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      if (res.data.success) {
        refreshUser();
      } else {
        alert(res.data.message);
      }
    } catch {
      alert("সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করো।");
    }
  }

  return (
    <div className="form-box" id="loginBox">
      <h2>Login</h2>
      <form id="loginForm" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          required
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Log In</button>
      </form>
      <p className="switch">
        Don't have an account?{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); switchToSignup(); }}>Sign Up</a>
      </p>
    </div>
  );
}

function SignupBox({ refreshUser, switchToLogin }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    schoolCollege: "",
    className: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/signup", form);
      if (res.data.success) {
        refreshUser();
      } else {
        alert(res.data.message);
      }
    } catch {
      alert("সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করো।");
    }
  }

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  return (
    <div className="form-box" id="signupBox">
      <h2>Sign Up</h2>
      <form id="signupForm" onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" required value={form.username} onChange={set("username")} />
        <input type="email" placeholder="Email" required value={form.email} onChange={set("email")} />
        <input type="password" placeholder="Password" required value={form.password} onChange={set("password")} />
        <input type="text" placeholder="School / College Name" required value={form.schoolCollege} onChange={set("schoolCollege")} />
        <input type="text" placeholder="Class" required value={form.className} onChange={set("className")} />
        <button type="submit">Sign Up</button>
      </form>
      <p className="switch">
        Already have an account?{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); switchToLogin(); }}>Log In</a>
      </p>
    </div>
  );
}
