import React from "react";

export default function AuthGateModal({
  open,
  variant = "download", // "download" | "labs" | "history"
  onClose,
  onSignup,
  onLogin,
  onGoogleLogin,
}) {
  if (!open) return null;

  const copy = {
    download: {
      title: "Download your DevOps scaffold",
      subtitle:
        "You’ve configured your stack. Create a free InfraScribe account to download the generated files.",
      bullets: [
        "Save and download your full scaffold as a ZIP",
        "Re-run and modify this setup later",
        "No cloud access. No auto-deployments.",
      ],
      cta: "Create free account",
    },
    labs: {
      title: "Unlock Assisted Mode (Labs)",
      subtitle:
        "Optional AI assistance for explanations and refinements. Core infrastructure remains deterministic.",
      bullets: [
        "Understand generated files faster",
        "Refine configs without rewriting from scratch",
        "Deterministic output still enforced",
      ],
      cta: "Enable with free account",
    },
    history: {
      title: "Save and revisit your scaffolds",
      subtitle:
        "Sign in to keep a history of generated configurations.",
      bullets: [
        "Re-generate without re-selecting options",
        "Compare previous scaffolds",
        "Iterate safely",
      ],
      cta: "Create free account",
    },
  };

  const { title, subtitle, bullets, cta } = copy[variant];

  return (
    <div className="auth-modal-backdrop">
      <div className="auth-modal">
        {/* Header */}
        <div className="auth-modal-header">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        {/* Value bullets */}
        <ul className="auth-modal-bullets">
          {bullets.map((b, i) => (
            <li key={i}>✔ {b}</li>
          ))}
        </ul>

        {/* Actions */}
        <div className="auth-modal-actions">
          <button className="btn btn-primary" onClick={onSignup}>
            {cta}
          </button>

          <button className="btn btn-secondary" onClick={onLogin}>
            Log in
          </button>

          <button
            className="btn btn-google"
            onClick={onGoogleLogin}
          >
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <div className="auth-modal-footer">
          <p>
            We generate code only. You review everything before deploying.
          </p>
          <p className="auth-modal-contract">
            By signing up, you agree to InfraScribe’s{" "}
            <a href="/contract" target="_blank" rel="noreferrer">
              Code-Only Contract
            </a>.
          </p>
        </div>

        {/* Close */}
        <button className="auth-modal-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}
