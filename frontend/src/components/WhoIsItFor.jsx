// frontend/src/components/WhoIsItFor.jsx

import React from "react"

export default function WhoIsItFor() {
  return (
    <section id="who" className="section">
      <h2 className="section-title">Who is InfraGenie for?</h2>
      <div className="cards-grid">
        <div className="card">
          <h3>Solo SaaS founders</h3>
          <p>
            You&apos;re building features, not YAML. InfraGenie handles CI/CD
            and Kubernetes so you can focus on shipping product.
          </p>
        </div>
        <div className="card">
          <h3>Small dev teams & agencies</h3>
          <p>
            Stop reinventing pipelines for every client project. Standardize
            Docker, CI/CD, and K8s templates across all apps in one place.
          </p>
        </div>
        <div className="card">
          <h3>Backend devs doing DevOps</h3>
          <p>
            Forced to manage infra without deep experience? Get production-grade
            pipelines and manifests generated for you, safely.
          </p>
        </div>
      </div>
    </section>
  )
}
