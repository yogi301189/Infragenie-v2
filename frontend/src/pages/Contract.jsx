import React from "react";

export default function Contract() {
  return (
    <main className="contract-page">
      <div className="contract-container">
        <h1>The InfraScribe Contract</h1>
        <p className="contract-intro">
          This page defines exactly what InfraScribe does, what it does not do,
          and where responsibility lies. We believe clarity builds trust.
        </p>

        <section>
          <h2>1. What InfraScribe Guarantees</h2>
          <p>
            InfraScribe generates DevOps <strong>scaffolding code only</strong>.
            This includes Dockerfiles, Kubernetes manifests, Terraform modules,
            CI/CD pipelines, and documentation.
          </p>
          <ul>
            <li>No infrastructure is applied automatically</li>
            <li>No cloud credentials are accessed or stored</li>
            <li>No state files are managed</li>
          </ul>
        </section>

        <section>
          <h2>2. Deterministic by Design</h2>
          <p>
            The same inputs produce the same output. InfraScribe does not make
            creative or autonomous infrastructure decisions.
          </p>
          <p>
            Infrastructure should be predictable. We treat this as a rule, not
            a preference.
          </p>
        </section>

        <section>
          <h2>3. What InfraScribe Will Never Do</h2>
          <ul>
            <li>Provision or delete cloud resources</li>
            <li>Modify existing infrastructure</li>
            <li>Run commands in your cloud account</li>
            <li>Charge you for cloud usage</li>
          </ul>
          <p>
            We deliver the code — <strong>not the bill</strong>.
          </p>
        </section>

        <section>
          <h2>4. How AI Is Used (Safely)</h2>
          <p>
            AI is used as a <strong>copywriter, not an architect</strong>.
          </p>
          <ul>
            <li>README explanations</li>
            <li>Comments and documentation</li>
            <li>Naming suggestions</li>
          </ul>
          <p>
            Infrastructure logic is generated using strict, versioned templates.
            Your database will not vanish because an LLM hallucinated.
          </p>
        </section>

        <section>
          <h2>5. Your Responsibility</h2>
          <p>
            InfraScribe provides a starting point. You are responsible for:
          </p>
          <ul>
            <li>Reviewing generated code</li>
            <li>Validating security and cost implications</li>
            <li>Testing before production deployment</li>
          </ul>
        </section>

        <section>
          <h2>6. Ownership & Longevity</h2>
          <p>
            Once generated, the code is yours. There is no runtime dependency on
            InfraScribe. You can modify, fork, or delete it freely.
          </p>
        </section>

        <section className="contract-footer">
          <p>
            <strong>
              InfraScribe exists to remove the blank page — not the engineer.
            </strong>
          </p>
        </section>
      </div>
    </main>
  );
}
