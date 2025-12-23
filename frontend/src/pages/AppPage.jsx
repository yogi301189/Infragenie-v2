import React, { useState } from "react";
import axios from "axios";

import GenerateForm from "../components/GenerateForm";
import OutputPanel from "../components/OutputPanel";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.getinfragenie.com";

export default function AppPage() {
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastPayload, setLastPayload] = useState(null);
  const [bundleLoading, setBundleLoading] = useState(false);

  const handleGenerate = async (formData) => {
    try {
      setLoading(true);
      setError("");
      setOutput(null);
      setLastPayload(formData);

      const res = await axios.post(
        `${API_BASE_URL}/api/generate`,
        formData,
        { timeout: 90000 }
      );

      setOutput(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Something went wrong while generating."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBundle = async () => {
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
      a.download = "infrascribe-scaffold.zip";
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setBundleLoading(false);
    }
  };

  return (
    <section className="generator-wrapper">
      <div className="generator-shell">
        <div className="generator-grid">
          <div className="generator-card">
            <GenerateForm
              onGenerate={handleGenerate}
              loading={loading}
            />
          </div>

          <div className="output-card">
            <OutputPanel
              output={output}
              error={error}
              loading={loading}
              onDownloadBundle={handleDownloadBundle}
              bundleLoading={bundleLoading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
