import { NavLink, Link } from "react-router-dom";

// Replaces the repeated <header class="header">...</header> block that was
// copy-pasted into index.html, about.php, Dashboard.php, account.php, startquiz.php.
export default function Header() {
  const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

  return (
    <header className="header">
      <Link to="/" className="logo">BrainBoost</Link>
      <nav className="navbar">
        <NavLink to="/about" className={linkClass}>About</NavLink>
        <NavLink to="/startquiz" className={linkClass}>Categories</NavLink>
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/account" className={linkClass}>Account</NavLink>
      </nav>
    </header>
  );
}
