// frontend/src/components/Hero.jsx

import React from "react";

export default function Hero({ onStart }) {
  const handleStart = () => {
    if (onStart) {
      onStart();
    } else {
      window.location.href = "https://app.infrascribe.dev";
    }
  };

  return (
    <header className="hero">
      <div className="hero-content hero-max">
        <p className="hero-tag">Deterministic DevOps Scaffolding</p>

        <h1>
          <span className="bg-gradient-to-r from-emerald-400 to-purple-500 text-transparent bg-clip-text">
            Generate a DevOps starting point. Not a black box.
          </span>
        </h1>

        <p className="hero-lead">
          InfraScribe generates a clean, deterministic DevOps scaffold —
          Dockerfile, CI/CD pipelines, Kubernetes manifests, and Terraform —
          so you don’t start from a blank page.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={handleStart}>
            Generate DevOps Scaffold
          </button>

          <span className="hero-note">
            Generates code only. Review before deploying.
          </span>
        </div>
      </div>
    </header>
  );
}
