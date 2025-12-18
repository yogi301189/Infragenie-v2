// frontend/src/components/Navbar.jsx

import React from "react";

export default function Navbar() {
  return (
    <nav className="site-header">
      <div className="nav-inner">
        {/* Left: Brand */}
        <a href="/" className="nav-logo">
          <span className="nav-logo-mark">IG</span>
          <span className="nav-logo-text">InfraGenie</span>
        </a>

        {/* Center: Navigation */}
        <nav className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#who" className="nav-link">Who it’s for</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </nav>

        {/* Right: Auth actions */}
        <div className="nav-actions">
          <a
            href="/login"
            className="btn btn-gradient nav-login"
          >
            Log in 
          </a>

          <a
            href="/signup"
            className="btn btn-gradient nav-cta"
          >
            Sign up
          </a>
        </div>
      </div>
    </nav>
  );
}
