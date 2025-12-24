import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import CodeBlock from "./CodeBlock.jsx";
import InfraLinesLoader from "./InfraLinesLoader.jsx";
import "./InfraLinesLoader.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.infrascribe.dev";

export default function OutputPanel({
  output,
  error,
  mode,
  aiFallback,
  loading,
  onDownloadBundle,
  bundleLoading,

  // 🔐 Auth / plan (passed from parent)
  isAuthenticated,
  userPlan, // "free" | "pro"
  onRequireAuth, // (variant) => void
  onRequireUpgrade // () => void
}) {
  /* --------------------------------------------------
   * Loading / empty / error states
   * -------------------------------------------------- */

  if (loading && !output && !error) {
    return (
      <div className="output-card" style={{ minHeight: "320px" }}>
        <div className="output-card-loading-inner">
          <div>
            <h2 className="output-title">
              {mode === "ai_thick"
                ? "AI is generating your DevOps bundle…"
                : "Generating your DevOps bundle…"}
            </h2>
            <p className="output-subtitle">
              InfraScribe is wiring Dockerfile, CI/CD, Kubernetes, GitOps and
              Terraform.
            </p>
          </div>
          <InfraLinesLoader />
        </div>
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
          CI/CD, Kubernetes, Terraform and more.
        </p>
      </div>
    );
  }

  /* --------------------------------------------------
   * Build flat files list
   * -------------------------------------------------- */

  const files = useMemo(() => {
    const result = output || {};
    const f = [];

    if (result.dockerfile) {
      f.push({
        id: "dockerfile",
        label: "Dockerfile",
        filename: "Dockerfile",
        content: result.dockerfile
      });
    }

    if (result.k8s_manifests) {
      Object.entries(result.k8s_manifests).forEach(([name, content]) => {
        f.push({
          id: `k8s-${name}`,
          label: `Kubernetes – ${name}`,
          filename: `k8s/${name}`,
          content
        });
      });
    }

    if (result.terraform_configs) {
      Object.entries(result.terraform_configs).forEach(([name, cfg]) => {
        const content = Object.entries(cfg)
          .map(
            ([fileName, body]) =>
              `# ===== ${fileName} =====\n${body}`
          )
          .join("\n\n");

        f.push({
          id: `tf-${name}`,
          label: `Terraform – ${name}`,
          filename: `infra/terraform/${name}`,
          content
        });
      });
    }

    if (result.readme_md) {
      f.push({
        id: "readme",
        label: "README / Guide",
        filename: "README.md",
        content: result.readme_md
      });
    }

    return f;
  }, [output]);

  /* --------------------------------------------------
   * Viewer state
   * -------------------------------------------------- */

  const [activeFileId, setActiveFileId] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanations, setExplanations] = useState({});
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState("");

  useEffect(() => {
    if (files.length > 0) {
      setActiveFileId(files[0].id);
    }
    setShowExplanation(false);
    setExplanations({});
    setExplainError("");
  }, [files]);

  const activeFile = files.find((f) => f.id === activeFileId);
  const renderedContent = activeFile?.content || "";

  /* --------------------------------------------------
   * Actions
   * -------------------------------------------------- */

  const handleCopy = async () => {
    await navigator.clipboard.writeText(renderedContent);
    alert(`Copied ${activeFile.filename}`);
  };

  const handleExplain = async () => {
    if (!isAuthenticated) {
      onRequireAuth("labs");
      return;
    }

    setShowExplanation(true);

    if (explanations[activeFile.id]) return;

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

      setExplanations((prev) => ({
        ...prev,
        [activeFile.id]: res.data.explanation
      }));
    } catch {
      setExplainError("Failed to generate explanation.");
    } finally {
      setExplainLoading(false);
    }
  };

  /* --------------------------------------------------
   * Render
   * -------------------------------------------------- */

  return (
    <div className="output-card output-layout-top-tabs">
      {/* Header */}
      <div className="output-header">
        <div>
          <h2 className="output-title">Generated DevOps Bundle</h2>
          <p className="output-subtitle">
            InfraScribe generated <strong>{files.length}</strong> files.
          </p>
        </div>

        <button
          className="btn btn-gradient"
          onClick={() => {
            if (!isAuthenticated) {
              onRequireAuth("download");
              return;
            }
            onDownloadBundle();
          }}
          disabled={bundleLoading || files.length === 0}
        >
          {bundleLoading ? "Preparing ZIP…" : "Download as ZIP"}
        </button>
      </div>

      {/* File Tabs */}
      <div className="file-tabs-row">
        {files.map((file) => (
          <button
            key={file.id}
            className={
              "file-tab-pill" +
              (file.id === activeFileId ? " active" : "")
            }
            onClick={() => {
              setActiveFileId(file.id);
              setShowExplanation(false);
              setExplainError("");
            }}
          >
            {file.label}
          </button>
        ))}
      </div>

      {/* Viewer */}
      <section className="file-viewer">
        {activeFile && (
          <>
            <div className="file-viewer-header">
              <span>{activeFile.filename}</span>
              <div>
                {!showExplanation && (
                  <button className="btn btn-ghost" onClick={handleCopy}>
                    Copy
                  </button>
                )}
                <button
                  className="btn btn-ghost"
                  onClick={handleExplain}
                >
                  AI explanation
                </button>
              </div>
            </div>

            {showExplanation ? (
              <div className="ai-explanation">
                {explainLoading && <p>Analyzing…</p>}
                {explainError && <p>{explainError}</p>}
                {!explainLoading &&
                  explanations[activeFile.id] && (
                    <pre>{explanations[activeFile.id]}</pre>
                  )}
              </div>
            ) : (
              <CodeBlock
                code={renderedContent}
                filename={activeFile.filename}
                label={activeFile.label}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
