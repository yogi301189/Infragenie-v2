// frontend/src/components/OutputPanel.jsx

import React from "react"

export default function OutputPanel({
  output,
  error,
  loading,
  onDownloadBundle,
  bundleLoading
}) {
  if (loading && !output && !error) {
    return (
      <div className="output-card">
        <p>Generating your Dockerfile, CI/CD, and manifests...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="output-card error">
        <h2>Error</h2>
        <pre>{error}</pre>
      </div>
    )
  }

  if (!output) {
    return (
      <div className="output-card">
        <p>Generated output will appear here.</p>
      </div>
    )
  }

  const {
    dockerfile,
    cicd_config,
    k8s_manifests,
    helm_chart,
    argocd_app,
    monitoring_configs,
    terraform_configs,     // ⬅️ NEW
  } = output

  const handleClickDownload = () => {
    if (!onDownloadBundle || bundleLoading) return
    onDownloadBundle()
  }

  return (
    <div className="output-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px"
        }}
      >
        <h2>Generated Configs</h2>
        <button
          className="btn-primary"
          style={{ padding: "8px 14px", fontSize: "0.9rem" }}
          onClick={handleClickDownload}
          disabled={bundleLoading}
        >
          {bundleLoading ? "Preparing ZIP..." : "Download as ZIP"}
        </button>
      </div>

      {dockerfile && (
        <section>
          <h3>Dockerfile</h3>
          <pre>{dockerfile}</pre>
        </section>
      )}

      {cicd_config && (
        <section>
          <h3>CI/CD Config</h3>
          <pre>{cicd_config}</pre>
        </section>
      )}

      {k8s_manifests && (
        <section>
          <h3>Kubernetes Manifests</h3>
          {Object.entries(k8s_manifests).map(([filename, content]) => (
            <div key={filename}>
              <h4>{filename}</h4>
              <pre>{content}</pre>
            </div>
          ))}
        </section>
      )}

      {helm_chart && (
        <section>
          <h3>Helm Chart Files</h3>
          {Object.entries(helm_chart).map(([filename, content]) => (
            <div key={filename}>
              <h4>{filename}</h4>
              <pre>{content}</pre>
            </div>
          ))}
        </section>
      )}

      {argocd_app && (
        <section>
          <h3>ArgoCD Applications</h3>
          {typeof argocd_app === "string" ? (
            <pre>{argocd_app}</pre>
          ) : (
            Object.entries(argocd_app).map(([filename, content]) => (
              <div key={filename}>
                <h4>{filename}</h4>
                <pre>{content}</pre>
              </div>
            ))
          )}
        </section>
      )}

      {terraform_configs && (
        <section>
          <h3>Terraform Configs</h3>
          {Object.entries(terraform_configs).map(([group, files]) => (
            <div key={group} style={{ marginBottom: "12px" }}>
              <h4>{group}</h4>
              {files &&
                Object.entries(files).map(([filename, content]) => (
                  <div key={filename}>
                    <h5>{filename}</h5>
                    <pre>{content}</pre>
                  </div>
                ))}
            </div>
          ))}
        </section>
      )}

      {monitoring_configs && (
        <section>
          <h3>Monitoring Configs</h3>
          {Object.entries(monitoring_configs).map(([filename, content]) => (
            <div key={filename}>
              <h4>{filename}</h4>
              <pre>{content}</pre>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
