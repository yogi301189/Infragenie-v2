import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function UserDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // 🔒 HARD GUARD — critical
  if (!user) return null;

  const displayName =
    user.displayName ||
    (user.email ? user.email.split("@")[0] : "User");

  const avatarLetter = displayName[0]?.toUpperCase() || "U";

  const plan = user.plan ? user.plan.toUpperCase() : "FREE";

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="user-dropdown">
      <button
        className="user-pill"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="avatar">{avatarLetter}</span>

        <span className="username">{displayName}</span>

        <span
          className={`plan-badge ${
            plan === "PRO" ? "plan-pro" : "plan-free"
          }`}
        >
          {plan}
        </span>

        <span className="caret">▾</span>
      </button>

      {open && (
        <div className="dropdown-panel">
          <div className="dropdown-header">
            <div className="dropdown-name">{displayName}</div>
            {user.email && (
              <div className="dropdown-email">{user.email}</div>
            )}
          </div>

          <div className="dropdown-section">
            <button onClick={() => navigate("/profile")}>
              My profile
            </button>
            <button onClick={() => navigate("/pricing")}>
              My plan
            </button>
          </div>

          <div className="dropdown-section">
            <button className="theme-toggle">
              Theme: Dark / Light
            </button>
          </div>

          <div className="dropdown-footer">
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
