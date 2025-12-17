// frontend/src/components/GenerateForm.jsx

import React, { useState } from "react"

export default function GenerateForm({ onGenerate, loading }) {
  const [language, setLanguage] = useState("python")
  const [framework, setFramework] = useState("flask")
  const [cicdTool, setCicdTool] = useState("github_actions")
  const [deployTarget, setDeployTarget] = useState("kubernetes")
  const [cloudProvider, setCloudProvider] = useState("aws")
  const [infraPreset, setInfraPreset] = useState("all"); // none | eks | ec2 | ecs | all
  const [includeGitops, setIncludeGitops] = useState(true)
  const [includeMonitoring, setIncludeMonitoring] = useState(false)
  const [extraContext, setExtraContext] = useState("")
  const [proMode, setProMode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    const payload = {
      language,
      framework,
      cicd_tool: cicdTool,
      deploy_target: deployTarget,
      cloud_provider: cloudProvider,
      include_gitops: includeGitops,
      include_monitoring: includeMonitoring,
      infra_preset: infraPreset,
      extra_context: extraContext || null,
      mode: proMode ? "ai_thick" : "rule_based",
    }
    onGenerate(payload)
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>Describe your stack</h2>
      
      <div className="form-row pro-toggle-row">
      <div className="pro-toggle-text">
      <span className="pro-label">Pro / Labs mode</span>
      <span className="pro-sub">
        Use AI full-stack bundle generation (beta). Currently behaves the same
        as standard mode but will roll out smarter generation here first.
      </span>
      </div>
      <button
      type="button"
      className={"pro-toggle-pill" + (proMode ? " pro-toggle-pill-active" : "")}
      onClick={() => setProMode((prev) => !prev)}
    >
      <span className="pro-toggle-thumb" />
      <span className="pro-toggle-text-pill">
        {proMode ? "AI Thick mode ON" : "Standard mode"}
      </span>
      </button>
      </div>
      <div className="form-row">
        <label>Language</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="node">Node.js</option>
        </select>
      </div>

      <div className="form-row">
        <label>Framework</label>
        <select value={framework} onChange={(e) => setFramework(e.target.value)}>
          <option value="flask">Flask</option>
          <option value="fastapi">FastAPI</option>
          <option value="express">Express</option>
        </select>
      </div>

      <div className="form-row">
        <label>CI/CD Tool</label>
        <select value={cicdTool} onChange={(e) => setCicdTool(e.target.value)}>
          <option value="github_actions">GitHub Actions</option>
          <option value="jenkins">Jenkins</option>
          <option value="gitlab_ci">GitLab CI</option>
        </select>
      </div>

      <div className="form-row">
        <label>Deploy Target</label>
        <select
          value={deployTarget}
          onChange={(e) => setDeployTarget(e.target.value)}
        >
          <option value="kubernetes">Kubernetes</option>
          <option value="helm">Helm</option>
        </select>
      </div>

      <div className="form-row">
        <label>Cloud Provider</label>
        <select
          value={cloudProvider}
          onChange={(e) => setCloudProvider(e.target.value)}
        >
          <option value="aws">AWS</option>
          <option value="gcp">GCP</option>
          <option value="azure">Azure</option>
        </select>
      </div>

      <div className="form-row checkbox-row">
        <label>
          <input
            type="checkbox"
            checked={includeGitops}
            onChange={(e) => setIncludeGitops(e.target.checked)}
          />
          Include GitOps (ArgoCD)
        </label>
      </div>

      <div className="form-row checkbox-row">
        <label>
          <input
            type="checkbox"
            checked={includeMonitoring}
            onChange={(e) => setIncludeMonitoring(e.target.checked)}
          />
          Include monitoring (Prometheus/Grafana)
        </label>
        </div>
      

{/* Infrastructure preset */}
<div className="form-group">
  <label htmlFor="infraPreset">Infrastructure preset (Terraform)</label>
  <select
    id="infraPreset"
    value={infraPreset}
    onChange={(e) => setInfraPreset(e.target.value)}
  >
    <option value="none">None (no Terraform)</option>
    <option value="eks">AWS EKS cluster (Kubernetes)</option>
    <option value="ec2">AWS EC2 Docker/K3s host</option>
    <option value="ecs">AWS ECS Fargate service</option>
    <option value="all">All of the above</option>
  </select>
  <p className="helper-text">
    Choose which Terraform infra you want in <code>infra/terraform/</code>.
  </p>
</div>


      <div className="form-row">
        <label>Extra context (optional)</label>
        <textarea
          value={extraContext}
          onChange={(e) => setExtraContext(e.target.value)}
          placeholder="Describe your app (ports, DB, auth, etc.)"
          rows={4}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Generating..." : "Generate DevOps Setup"}
      </button>
    </form>
  )
}
