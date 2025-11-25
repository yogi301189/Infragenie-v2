// frontend/src/components/Hero.jsx

import React from "react"


export default function Hero() {
  const scrollToGenerator = () => {
    const el = document.getElementById("generator-section")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <header className="hero">
      <div className="hero-content hero-max">
        <p className="hero-tag">AI DevOps Copilot</p>
        <h1>
<span className="bg-gradient-to-r from-emerald-400 to-purple-500 text-transparent bg-clip-text">
                
Ship CI/CD & Kubernetes in minutes, not weeks.
              </span></h1>
        <p className="hero-lead">
          InfraGenie generates Dockerfiles, CI/CD pipelines, Kubernetes/Helm
          manifests, GitOps configs, and monitoring setups tailored to your app.
          No full-time DevOps engineer required.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={scrollToGenerator}>
            Generate my DevOps setup   
          </button>
          <span className="hero-note">
            
          </span>
        </div>
      </div>
    </header>
  )
}
