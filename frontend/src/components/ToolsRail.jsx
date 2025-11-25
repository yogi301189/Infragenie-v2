// frontend/src/components/ToolsRail.jsx

import React from "react"

const tools = [
  { key: "docker", label: "Docker" },
  { key: "cicd", label: "CI/CD" },
  { key: "k8s", label: "Kubernetes" },
  { key: "helm", label: "Helm" },
  { key: "gitops", label: "GitOps" }
]

export default function ToolsRail() {
  return (
    <div className="tools-rail">
      {tools.map((tool, index) => (
        <div key={tool.key} className="tools-row">
          <div className="tools-bar" data-index={index}>
            <div className="tool-bubble">
              <span className="tool-bubble-inner" />
            </div>
          </div>
          <span className="tool-label">{tool.label}</span>
        </div>
      ))}
    </div>
  )
}
