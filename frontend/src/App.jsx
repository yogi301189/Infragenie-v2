// frontend/src/App.jsx

import React, { useState } from "react"
import axios from "axios"
import GenerateForm from "./components/GenerateForm.jsx"
import OutputPanel from "./components/OutputPanel.jsx"
import Navbar from "./components/Navbar.jsx"
import Hero from "./components/Hero.jsx"
import WhoIsItFor from "./components/WhoIsItFor.jsx"
import FeaturesSection from "./components/FeaturesSection.jsx"
import PricingSection from "./components/PricingSection.jsx"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.getinfragenie.com"

export default function App() {
  const [output, setOutput] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastPayload, setLastPayload] = useState(null)
  const [bundleLoading, setBundleLoading] = useState(false)

  const handleGenerate = async (formData) => {
  try {
    setLoading(true)
    setError("")
    setOutput(null)
    setLastPayload(formData)

    const res = await axios.post(
      `${API_BASE_URL}/api/generate`,
      formData,
      {
        timeout: 90000 // 90s safety timeout
      }
    )
    setOutput(res.data)
  } catch (err) {
    console.error("Generate error:", err)

    if (err.code === "ECONNABORTED") {
      setError("Generation took too long and timed out. Please try again.")
    } else {
      setError(
        err?.response?.data?.detail ||
          "Something went wrong while generating. Please try again."
      )
    }
  } finally {
    setLoading(false)
  }
}


  const handleDownloadBundle = async () => {
    if (!lastPayload) return
    try {
      setBundleLoading(true)
      const res = await axios.post(
        `${API_BASE_URL}/api/generate/bundle`,
        lastPayload,
        {
          responseType: "blob"
        }
      )

      const blob = new Blob([res.data], { type: "application/zip" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "infragenie-bundle.zip"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error downloading bundle:", err)
      alert("Failed to download bundle. Please try again.")
    } finally {
      setBundleLoading(false)
    }
  }

  return (
    <div className="app-root">
      <Navbar />
      <Hero />

      {/* Live generator section */}
      <section id="generator-section" className="section section-tight">
        <h2 className="section-title">See InfraGenie in action</h2>
        <p className="section-subtitle">
          Describe your stack and get Dockerfiles, CI/CD pipelines, Kubernetes,
          Helm, GitOps and monitoring configs generated for you.
        </p>

        <div className="main-layout">
          <section className="left-panel">
            <GenerateForm onGenerate={handleGenerate} loading={loading} />
          </section>
          <section className="right-panel">
            <OutputPanel
              output={output}
              error={error}
              loading={loading}
              onDownloadBundle={handleDownloadBundle}
              bundleLoading={bundleLoading}
            />
          </section>
        </div>
      </section>
<section className="section section-tight how-it-works">
  <h2 className="section-title">How InfraGenie fits into your workflow</h2>
  <p className="section-subtitle">
    You don&apos;t have to throw away your existing tools. InfraGenie just
    jump-starts the boring setup.
  </p>

  <div className="how-grid">
    <div className="how-card">
      <h3>1. Describe your app</h3>
      <p>
        Tell InfraGenie your language, framework, CI/CD preference, cloud
        provider, and any extra context like &quot;Swiggy-style food delivery app&quot;.
      </p>
    </div>
    <div className="how-card">
      <h3>2. Generate the DevOps bundle</h3>
      <p>
        InfraGenie creates Dockerfile, CI/CD pipeline, Kubernetes manifests,
        ArgoCD apps, Terraform presets, and a README — all visible in the
        right-hand viewer.
      </p>
    </div>
    <div className="how-card">
      <h3>3. Refine & commit</h3>
      <p>
        Use AI explanation to understand each file, tweak anything with
        &quot;Refine file&quot;, then download the ZIP and push it to your Git repo.
      </p>
    </div>
  </div>
</section>

      <FeaturesSection />
      <WhoIsItFor />
      <PricingSection />

      <footer className="footer">
        <span>© {new Date().getFullYear()} InfraGenie. All rights reserved.</span>
      </footer>
    </div>
  )
}
