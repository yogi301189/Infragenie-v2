import { useState, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function UserDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="user-dropdown">
      <button
        className="user-pill"
        onClick={() => setOpen(!open)}
      >
        <span className="avatar">
          {(user.displayName || user.email)[0].toUpperCase()}
        </span>
        <span className="username">
          {user.displayName || user.email.split("@")[0]}
        </span>
        <span
  className={`plan-badge ${
    user.plan === "pro" ? "plan-pro" : "plan-free"
  }`}
>
  {user.plan.toUpperCase()}
</span>

        <span className="caret">▾</span>
      </button>

      {open && (
        <div className="dropdown-panel">
          <div className="dropdown-header">
            <div className="dropdown-name">
              {user.displayName || "InfraGenie User"}
            </div>
            <div className="dropdown-email">{user.email}</div>
          </div>

          <div className="dropdown-section">
            <button onClick={() => navigate("/profile")}>My profile</button>
            <button onClick={() => navigate("/pricing")}>My plan</button>
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

