import React, { useState } from "react";
import MarkdownRenderer from "../components/MarkdownRenderer";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "terraform", label: "Terraform" },
  { id: "kubernetes", label: "Kubernetes" },
  { id: "cicd", label: "CI/CD" },
  { id: "review", label: "Infra Review" },
  { id: "export", label: "Exports" }
];

export default function Docs() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0b0f1a] text-gray-200">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-4">
        <h2 className="text-sm font-semibold text-gray-400 mb-4">
          DOCUMENTATION
        </h2>

        <nav className="space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition
                ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {renderTab(activeTab)}
      </main>
    </div>
  );
}

/* ---------------- TAB CONTENT ---------------- */

function renderTab(tab) {
  switch (tab) {
    case "overview":
      return <Overview />;
    case "architecture":
      return <Architecture />;
    case "terraform":
      return <Terraform />;
    case "kubernetes":
      return <Kubernetes />;
    case "cicd":
      return <CICD />;
    case "review":
      return <InfraReview />;
    case "export":
      return <Exports />;
    default:
      return null;
  }
}

/* ---------------- SECTIONS ---------------- */

function Overview() {
  const markdown = `
# Infrastructure Overview

This stack deploys a **Flask-based application** on **AWS** using **Kubernetes**.

## Key Characteristics
- Scalable containerized workload
- GitHub Actions for CI/CD
- GitOps-based deployment

## Intended Use
- REST APIs
- Internal services
- Production-grade workloads
`;

  return (
    <Section title="Overview">
      <MarkdownRenderer content={markdown} />
    </Section>
  );
}


function Architecture() {
  return (
    <Section title="Architecture">
      <ul className="list-disc ml-5 space-y-2">
        <li>Client traffic enters via Load Balancer / Ingress</li>
        <li>Requests route to Kubernetes services and pods</li>
        <li>CI/CD pushes images and updates manifests</li>
        <li>GitOps manages cluster state</li>
      </ul>
    </Section>
  );
}

function Terraform() {
  return (
    <Section title="Terraform">
      <p>
        Terraform provisions AWS infrastructure including compute, networking,
        and Kubernetes resources.
      </p>
      <ul className="list-disc ml-5 space-y-2">
        <li>Providers configured for AWS</li>
        <li>Resources separated by environment</li>
        <li>Remote state recommended for safety</li>
      </ul>
    </Section>
  );
}

function Kubernetes() {
  return (
    <Section title="Kubernetes">
      <ul className="list-disc ml-5 space-y-2">
        <li>Rolling update deployment strategy</li>
        <li>Service exposes application internally</li>
        <li>Ingress controls external access</li>
        <li>Pods restart automatically on failure</li>
      </ul>
    </Section>
  );
}

function CICD() {
  return (
    <Section title="CI/CD">
      <ul className="list-disc ml-5 space-y-2">
        <li>Triggered on code push</li>
        <li>Builds and pushes Docker images</li>
        <li>Deploys via GitOps workflow</li>
        <li>Supports rollback through versioned manifests</li>
      </ul>
    </Section>
  );
}

function InfraReview() {
  return (
    <Section title="Infra Review">
      <div className="space-y-4">
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-md">
          <h4 className="font-semibold text-red-400">Potential Risks</h4>
          <ul className="list-disc ml-5 mt-2">
            <li>No resource limits defined for containers</li>
            <li>No monitoring enabled</li>
          </ul>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-md">
          <h4 className="font-semibold text-green-400">Suggestions</h4>
          <ul className="list-disc ml-5 mt-2">
            <li>Enable Horizontal Pod Autoscaler</li>
            <li>Add Prometheus & Grafana</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

function Exports() {
  return (
    <Section title="Exports">
      <div className="space-y-3">
        <button className="btn-primary">Download README.md</button>
        <button className="btn-secondary">Export as PDF (Pro)</button>
        <button className="btn-secondary">Notion / Confluence (Pro)</button>
      </div>
    </Section>
  );
}

/* ---------------- SHARED ---------------- */

function Section({ title, children }) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">{title}</h1>
      <div className="space-y-4 text-gray-300">{children}</div>
    </div>
  );
}
