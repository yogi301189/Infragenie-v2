// frontend/src/components/OutputPanel.jsx

import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import CodeBlock from "./CodeBlock.jsx";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function OutputPanel({
  output,
  error,
  loading,
  onDownloadBundle,
  bundleLoading
}) {
  // --- early states ---
  if (loading && !output && !error) {
    return (
      <div className="output-card">
        <p>Generating your Dockerfile, CI/CD, and manifests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="output-card output-card-error">
        <h2>Error</h2>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="output-card">
        <p>
          Generated output will appear here. Run a generation to see Dockerfile,
          CI/CD, Kubernetes, Helm, ArgoCD, Terraform, and monitoring configs.
        </p>
      </div>
    );
  }

  // --- build flat files[] list ---
  const files = useMemo(() => {
    const result = output || {};
    const f = [];

    // Dockerfile
    if (result.dockerfile) {
      f.push({
        id: "dockerfile",
        label: "Dockerfile",
        filename: "Dockerfile",
        content: result.dockerfile
      });
    }

    // CI/CD
    if (result.cicd_config) {
      const cicd = result.cicd_config;
      if (cicd.jenkinsfile) {
        f.push({
          id: "cicd-jenkins",
          label: "CI/CD – Jenkinsfile",
          filename: "cicd/Jenkinsfile",
          content: cicd.jenkinsfile
        });
      }
      if (cicd.github_actions) {
        f.push({
          id: "cicd-gha",
          label: "CI/CD – GitHub Actions",
          filename: ".github/workflows/infragenie-ci.yml",
          content: cicd.github_actions
        });
      }
    }

    // Kubernetes
    if (result.k8s_manifests) {
      Object.entries(result.k8s_manifests).forEach(([name, content]) => {
        if (!content) return;
        f.push({
          id: `k8s-${name}`,
          label: `Kubernetes – ${name}`,
          filename: `k8s/${name}`,
          content
        });
      });
    }

    // Helm
    if (result.helm_chart) {
      Object.entries(result.helm_chart).forEach(([name, content]) => {
        if (!content) return;
        f.push({
          id: `helm-${name}`,
          label: `Helm – ${name}`,
          filename: `helm/${name}`,
          content
        });
      });
    }

    // ArgoCD
    if (result.argocd_app) {
      if (result.argocd_app["infragenie-app.yaml"]) {
        f.push({
          id: "argocd-app",
          label: "ArgoCD – App",
          filename: "gitops/infragenie-app.yaml",
          content: result.argocd_app["infragenie-app.yaml"]
        });
      }
      if (result.argocd_app["infragenie-root.yaml"]) {
        f.push({
          id: "argocd-root",
          label: "ArgoCD – Root App",
          filename: "gitops/infragenie-root.yaml",
          content: result.argocd_app["infragenie-root.yaml"]
        });
      }
    }

    // Monitoring
    if (result.monitoring_configs) {
      Object.entries(result.monitoring_configs).forEach(([name, content]) => {
        if (!content) return;
        f.push({
          id: `monitor-${name}`,
          label: `Monitoring – ${name}`,
          filename: `monitoring/${name}`,
          content
        });
      });
    }

    // Terraform (combine per target)
    if (result.terraform_configs) {
      Object.entries(result.terraform_configs).forEach(([name, cfg]) => {
        if (!cfg) return;

        let content;
        if (typeof cfg === "string") {
          content = cfg;
        } else if (typeof cfg === "object") {
          content = Object.entries(cfg)
            .map(
              ([fileName, fileBody]) =>
                `# ===== ${fileName} =====\n${fileBody}`
            )
            .join("\n\n");
        } else {
          content = String(cfg);
        }

        f.push({
          id: `tf-${name}`,
          label: `Terraform – ${name}`,
          filename: `terraform/${name} (multiple files)`,
          content
        });
      });
    }

    return f;
  }, [output]);

  const [activeFileId, setActiveFileId] = useState(
    files.length > 0 ? files[0].id : null
  );
  const [showExplanation, setShowExplanation] = useState(false);

  // cache of explanations: { [fileId]: string }
  const [explanations, setExplanations] = useState({});
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState("");

  // per-file overrides (for refined content)
  const [fileOverrides, setFileOverrides] = useState({}); // { [fileId]: string }

  // refine UI state
  const [showRefineBox, setShowRefineBox] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineError, setRefineError] = useState("");

  useEffect(() => {
    if (files.length > 0) {
      setActiveFileId(files[0].id);
    } else {
      setActiveFileId(null);
    }
    setShowExplanation(false);
    setExplanations({});
    setExplainLoading(false);
    setExplainError("");
    setFileOverrides({});
    setShowRefineBox(false);
    setRefineText("");
    setRefineError("");
  }, [files]);

  const activeFile = files.find((f) => f.id === activeFileId) || null;

  // Base content from backend
  const baseContent =
    activeFile && typeof activeFile.content === "string"
      ? activeFile.content
      : activeFile
      ? JSON.stringify(activeFile.content, null, 2)
      : "";

  // If refined, prefer override
  const effectiveContent =
    activeFile && fileOverrides[activeFile.id]
      ? fileOverrides[activeFile.id]
      : baseContent;

  const renderedContent = effectiveContent;

  const currentExplanation =
    activeFile && explanations[activeFile.id]
      ? explanations[activeFile.id]
      : "";

  const handleCopy = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(renderedContent);
      alert(`Copied: ${activeFile.filename}`);
    } catch (err) {
      console.error("Copy failed", err);
      alert("Failed to copy to clipboard.");
    }
  };

  const totalFiles = files.length;

  const handleRefineSubmit = async () => {
    if (!activeFile) return;
    if (!refineText.trim()) {
      setRefineError("Please describe what you want to change.");
      return;
    }

    try {
      setRefineLoading(true);
      setRefineError("");

      const res = await axios.post(
        `${API_BASE_URL}/api/generate/refine`,
        {
          filename: activeFile.filename,
          label: activeFile.label,
          content: renderedContent, // current version (may already be refined)
          instructions: refineText
        }
      );

      const updated = res.data?.updated_content;
      if (!updated) {
        setRefineError("No updated content returned from server.");
        return;
      }

      // Save override for this file
      setFileOverrides((prev) => ({
        ...prev,
        [activeFile.id]: updated
      }));

      // Clear explanation for this file so it can be re-generated on demand
      setExplanations((prev) => {
        const copy = { ...prev };
        delete copy[activeFile.id];
        return copy;
      });
      setShowExplanation(false);

      // Close refine box
      setShowRefineBox(false);
      setRefineText("");
    } catch (err) {
      console.error("Refine error:", err);
      setRefineError(
        err?.response?.data?.detail ||
          "Failed to refine this file. Please try again."
      );
    } finally {
      setRefineLoading(false);
    }
  };

  // Toggle AI explanation: call backend on first open per file
  const handleToggleExplanation = async () => {
    if (!activeFile) return;

    // If already showing → just hide
    if (showExplanation) {
      setShowExplanation(false);
      return;
    }

    setShowExplanation(true);
    setExplainError("");

    // If we already have an explanation cached for this file, don't call again
    if (explanations[activeFile.id]) {
      return;
    }

    try {
      setExplainLoading(true);

      const res = await axios.post(
        `${API_BASE_URL}/api/generate/explain`,
        {
          filename: activeFile.filename,
          label: activeFile.label,
          content: renderedContent
        }
      );

      const text =
        res.data?.explanation || "No explanation was generated for this file.";

      setExplanations((prev) => ({
        ...prev,
        [activeFile.id]: text
      }));
    } catch (err) {
      console.error("Explain error:", err);
      setExplainError(
        err?.response?.data?.detail ||
          "Failed to generate explanation. Please try again."
      );
    } finally {
      setExplainLoading(false);
    }
  };

  return (
    <div className="output-card output-layout-top-tabs">
      {/* Header */}
      <div className="output-header">
        <div>
          <h2 className="output-title">Generated DevOps Bundle</h2>
          <p className="output-subtitle">
            InfraGenie generated <strong>{totalFiles}</strong> files for this run.
          </p>
        </div>

        {onDownloadBundle && (
          <button
            className="btn btn-gradient"
            onClick={onDownloadBundle}
            disabled={bundleLoading || totalFiles === 0}
          >
            {bundleLoading ? "Preparing ZIP..." : "Download as ZIP"}
          </button>
        )}
      </div>

      {/* File tabs */}
      <div className="file-tabs-row">
        {files.map((file) => (
          <button
            key={file.id}
            className={
              "file-tab-pill" +
              (file.id === activeFileId ? " file-tab-pill-active" : "")
            }
            onClick={() => {
              setActiveFileId(file.id);
              setShowExplanation(false);
              setExplainError("");
              setShowRefineBox(false);
              setRefineText("");
              setRefineError("");
            }}
          >
            {file.label}
          </button>
        ))}
      </div>

      {/* Viewer: code OR explanation */}
      <section className="file-viewer file-viewer-full">
        {activeFile ? (
          <>
 <div className="file-viewer-header">
  <div className="file-meta">
    <span className="file-meta-label">
      {showExplanation ? "Explaining" : "Viewing"}
    </span>
    <span className="file-name">{activeFile.filename}</span>
  </div>
  <div className="file-viewer-actions">
    {!showExplanation && (
      <button className="btn btn-ghost" onClick={handleCopy}>
        Copy
      </button>
    )}
    <button
      className={
        "btn btn-ghost ai-toggle-btn" +
        (showExplanation ? " ai-toggle-active" : "")
      }
      onClick={handleToggleExplanation}
    >
      {showExplanation ? "Hide AI explanation" : "AI explanation"}
    </button>
    <button
      className="btn btn-ghost ai-toggle-btn"
      onClick={() => {
        setShowRefineBox((prev) => !prev);
        setRefineError("");
      }}
    >
      {showRefineBox ? "Hide refine" : "Refine file"}
    </button>
  </div>
</div>

{showRefineBox && (
  <div className="refine-box">
    <label className="refine-label">
      Describe how you want to change this file:
    </label>
    <textarea
      className="refine-textarea"
      rows={3}
      placeholder='Examples: "Increase replicas from 2 to 5", "change instance type to t3.medium", "expose port 8080 instead of 5000"'
      value={refineText}
      onChange={(e) => setRefineText(e.target.value)}
    />
    {refineError && <p className="refine-error">{refineError}</p>}
    <div className="refine-actions">
      <button
        className="btn btn-ghost"
        onClick={() => {
          setShowRefineBox(false);
          setRefineText("");
          setRefineError("");
        }}
        disabled={refineLoading}
      >
        Cancel
      </button>
      <button
        className="btn btn-gradient"
        onClick={handleRefineSubmit}
        disabled={refineLoading}
      >
        {refineLoading ? "Refining…" : "Apply refine"}
      </button>
    </div>
  </div>
)}


            {showExplanation ? (
              <div className="ai-explanation-only">
                <div className="ai-explanation-header">
                  <div>
                    <span className="ai-chip-label">AI explanation</span>
                    <h3 className="ai-title">
                      For <span>{activeFile.filename}</span>
                    </h3>
                  </div>
                  <span className="ai-model-pill">InfraGenie · AI</span>
                </div>

                <div className="ai-explanation-body">
                  {explainLoading && (
                    <p className="ai-intro">Analyzing this file…</p>
                  )}

                  {!explainLoading && explainError && (
                    <p className="ai-footer ai-error">{explainError}</p>
                  )}

                  {!explainLoading && !explainError && currentExplanation && (
                    <pre className="ai-explanation-text">
                      {currentExplanation}
                    </pre>
                  )}

                  {!explainLoading &&
                    !explainError &&
                    !currentExplanation && (
                      <p className="ai-footer">
                        No explanation available yet. Click "AI explanation" to
                        try again.
                      </p>
                    )}
                </div>
              </div>
            ) : (
              <CodeBlock
                code={renderedContent}
                filename={activeFile.filename}
                label={activeFile.label}
              />
            )}
          </>
        ) : (
          <p className="file-viewer-empty">
            Select a file above to view its contents.
          </p>
        )}
      </section>
    </div>
  );
}
