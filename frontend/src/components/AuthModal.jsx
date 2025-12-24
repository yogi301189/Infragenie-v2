// frontend/src/components/AuthModal.jsx
import "./AuthModal.css";

export default function AuthModal({ open, onClose, mode = "login" }) {
  if (!open) return null;

  return (
    <div className="auth-modal-backdrop">
      <div className="auth-modal">
        <h2>
          {mode === "upgrade"
            ? "Upgrade to Pro"
            : "Sign in to continue"}
        </h2>

        <p className="auth-modal-subtitle">
          {mode === "upgrade"
            ? "This feature is available on the Pro plan."
            : "Create a free account to download your DevOps bundle."}
        </p>

        <div className="auth-actions">
          <button className="btn btn-gradient">
            Continue with Email
          </button>

          <button className="btn btn-ghost">
            Continue with Google
          </button>
        </div>

        <button className="auth-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}
