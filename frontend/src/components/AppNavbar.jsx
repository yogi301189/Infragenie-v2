import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "./UserDropdown";

export default function AppNavbar() {
  const { user, loading } = useAuth();

  return (
    <header className="site-header">
      <div className="nav-inner">
        {/* Brand */}
        <Link to="/app" className="nav-logo">
          <span className="nav-logo-mark">IS</span>
          <span className="nav-logo-text">InfraScribe</span>
        </Link>

        {/* App links */}
        <div className="nav-links">
          <Link to="/app" className="nav-link">Generator</Link>
          <Link to="/app/history" className="nav-link">History</Link>
          <Link to="/app/docs" className="nav-link">Docs</Link>
        </div>

        {/* User */}
        <div className="nav-actions">
          {loading ? null : user ? (
            <UserDropdown user={user} />
          ) : null}
        </div>
      </div>
    </header>
  );
}
