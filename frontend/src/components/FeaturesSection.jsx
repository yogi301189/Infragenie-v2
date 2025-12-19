// frontend/src/components/FeaturesSection.jsx

import React from "react"

export default function FeaturesSection() {
  const features = [
    {
      title: "Dockerfiles that just work",
      body: "Language- and framework-aware Dockerfiles with sensible defaults for Python, Node.js and more."
    },
    {
      title: "CI/CD in one click",
      body: "GitHub Actions, Jenkins, or GitLab CI pipelines that build, tag, and push Docker images."
    },
    {
      title: "Kubernetes & Helm",
      body: "Deployment + Service manifests and Helm charts with clean values.yaml ready for dev/stage/prod."
    },
    {
      title: "GitOps with ArgoCD",
      body: "ArgoCD Application YAML that plugs straight into your GitOps repo and cluster."
    },
    {
      title: "Monitoring-ready",
      body: "Prometheus scrape config and starter Grafana dashboard JSON for your app’s metrics."
    },
    {
      title: "ZIP export",
      body: "Download a ready-to-use bundle with everything wired up and documented in README-INFRAGENIE."
    }
  ]

  return (
    <section id="features" className="features-section">
      <h2 className="section-title">What InfraGenie generates for you</h2>
      <div className="cards-grid">
        {features.map((f) => (
          <div key={f.title} className="card">
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
