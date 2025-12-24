import React, { useState } from "react";
import axios from "axios";

import GenerateForm from "../components/GenerateForm";
import OutputPanel from "../components/OutputPanel";
import AuthGateModal from "../components/AuthGateModal";

import { useAuth } from "../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.infrascribe.dev";

export default function AppPage() {
  const { user } = useAuth();

  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastPayload, setLastPayload] = useState(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authVariant, setAuthVariant] = useState("download");

  const requireAuth = (variant = "download") => {
    setAuthVariant(variant);
    setAuthModalOpen(true);
  };

  const handleGenerate = async (payload) => {
    setLoading(true);
    setError("");
    setLastPayload(payload);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/generate`,
        payload
      );
      setOutput(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate infrastructure.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBundle = async () => {
    if (!user) {
      requireAuth("download");
      return;
    }

    if (!lastPayload) return;

    try {
      setBundleLoading(true);

      const res = await axios.post(
        `${API_BASE_URL}/api/generate/bundle`,
        lastPayload,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "infrascribe-bundle.zip";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download ZIP");
    } finally {
      setBundleLoading(false);
    }
  };

  return (
    <div className="app-layout">
      {/* LEFT: Generator */}
      <GenerateForm onGenerate={handleGenerate} />

      {/* RIGHT: Output */}
      <OutputPanel
        output={output}
        loading={loading}
        error={error}
        bundleLoading={bundleLoading}
        onDownloadBundle={handleDownloadBundle}
      />

      {/* Auth gate modal */}
      <AuthGateModal
        open={authModalOpen}
        variant={authVariant}
        onClose={() => setAuthModalOpen(false)}
        onSignup={() => window.location.assign("/signup")}
        onLogin={() => window.location.assign("/login")}
        onGoogleLogin={() =>
          window.location.assign("/login?provider=google")
        }
      />
    </div>
  );
}
