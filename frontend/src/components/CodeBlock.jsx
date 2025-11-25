// frontend/src/components/CodeBlock.jsx

import React, { useEffect, useRef } from "react";
import Prism from "prismjs";

// Load languages you care about
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-json";
import "prismjs/components/prism-hcl";      // Terraform
import "prismjs/components/prism-bash";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-markup";   // HTML, XML

// Theme (you can change to another Prism theme if you like)
import "prismjs/themes/prism-tomorrow.css";

function detectLanguage(filename = "", label = "") {
  const name = filename.toLowerCase();
  const lbl = (label || "").toLowerCase();

  if (name === "dockerfile" || lbl.includes("dockerfile")) return "docker";
  if (name.includes("jenkinsfile") || lbl.includes("jenkins")) return "groovy";
  if (name.endsWith(".yaml") || name.endsWith(".yml")) return "yaml";
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".tf") || lbl.includes("terraform")) return "hcl";
  if (name.endsWith(".sh")) return "bash";
  if (name.endsWith(".py")) return "python";
  if (name.endsWith(".js")) return "javascript";
  if (name.endsWith(".ts")) return "typescript";
  if (name.endsWith(".html") || name.endsWith(".xml")) return "markup";

  // Fallback for generic config files
  if (lbl.includes("kubernetes") || lbl.includes("k8s")) return "yaml";
  if (lbl.includes("helm")) return "yaml";

  return "bash"; // safe default
}

export default function CodeBlock({ code, filename, label }) {
  const ref = useRef(null);
  const language = detectLanguage(filename, label);
  const className = `language-${language}`;

  useEffect(() => {
    if (ref.current) {
      Prism.highlightAllUnder(ref.current);
    }
  }, [code, language]);

  return (
    <pre ref={ref} className={`file-content-pre ${className}`}>
      <code className={className}>{code}</code>
    </pre>
  );
}
