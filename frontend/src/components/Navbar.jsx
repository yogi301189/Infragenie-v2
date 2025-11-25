// frontend/src/components/Navbar.jsx

import React from "react"

export default function Navbar() {
  const scrollToGenerator = () => {
    const el = document.getElementById("generator-section")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <nav className="nav">
      <div className="nav-left">
        <span className="nav-logo">InfraGenie</span>
      </div>
      <div className="nav-right">
        <button className="nav-link" onClick={scrollToGenerator}>
          See it in action
        </button>
        <a href="#pricing" className="nav-link">
          Pricing
        </a>
        <a href="#who-is-it-for" className="nav-link">
          Who it's for
        </a>
      </div>
    </nav>
  )
}
