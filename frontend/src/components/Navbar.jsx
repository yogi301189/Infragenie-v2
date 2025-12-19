// frontend/src/components/Navbar.jsx

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "./UserDropdown";

export default function Navbar() {
   const { user } = useAuth();// ✅ Hook INSIDE component

  return (
    <nav className="site-header">
      <div className="nav-inner">
        {/* Left: Brand */}
        <Link to="/" className="nav-logo">
          <span className="nav-logo-mark">IG</span>
          <span className="nav-logo-text">InfraGenie</span>
        </Link>

        {/* Center: Navigation */}
        <nav className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#who" className="nav-link">Who it’s for</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </nav>

        {/* Right: Auth actions */}
        <div className="nav-actions">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-gradient">
                Sign up
              </Link>
            </>
            
          ) : (
            <UserDropdown user={user} />
          )}
        </div>
      </div>
    </nav>
  );
}
