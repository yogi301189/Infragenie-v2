// frontend/src/components/PricingSection.jsx

import React from "react"
import axios from "axios";

const upgradeToPro = async () => {
  const res = await axios.post(
    `${API_BASE_URL}/billing/checkout`,
    { price_id: "price_123" },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  window.location.href = res.data.url;
};

export default function PricingSection() {
  return (
    <section id="pricing" className="section">
      <h2 className="section-title">Simple, founder-friendly pricing</h2>
      <div className="pricing-grid">
        <div className="card pricing-card">
          <h3>Free</h3>
          <p className="pricing-price">$0 / month</p>
          <ul className="pricing-list">
            <li>Limited generations per month</li>
            <li>Dockerfile + CI/CD pipeline</li>
            <li>Kubernetes manifests (basic)</li>
          </ul>
          <p className="pricing-note">Perfect for testing InfraScribe.</p>
        </div>

        <div className="card pricing-card pricing-card-highlight">
          <h3>Pro (Early Access)</h3>
          <p className="pricing-price">$9 / month</p>
          <ul className="pricing-list">
            <li>Unlimited generations</li>
            <li>Dockerfile + CI/CD + K8s + Helm</li>
            <li>ArgoCD GitOps YAML</li>
            <li>Monitoring configs (Prometheus/Grafana)</li>
            <li>Priority support from the creator</li>
          </ul>
          <p className="pricing-note">
            Intro pricing for early users. Lock it in for life.
          </p>
        </div>
      </div>
    </section>
  )
}
