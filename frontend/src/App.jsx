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

      <FeaturesSection />
      <WhoIsItFor />
      <PricingSection />

      <footer className="footer">
        <span>© {new Date().getFullYear()} InfraGenie. All rights reserved.</span>
      </footer>
    </div>
  )
}
