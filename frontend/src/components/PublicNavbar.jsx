import React from "react";
import { Link } from "react-router-dom";

export default function PublicNavbar() {
  return (
    <header className="site-header">
      <div className="nav-inner">
        {/* Brand */}
        <Link to="/" className="nav-logo">
          <span className="nav-logo-mark">IS</span>
          <span className="nav-logo-text">InfraScribe</span>
        </Link>

        {/* Marketing links */}
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#who" className="nav-link">Who it’s for</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <Link to="/contract" className="nav-link">Contract</Link>
        </div>

        {/* CTA */}
        <div className="nav-actions">
          <a
            href="https://app.infrascribe.dev"
            className="btn btn-gradient"
          >
            Generate Scaffold
          </a>
        </div>
      </div>
    </header>
  );
}
