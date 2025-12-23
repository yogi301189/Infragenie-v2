// frontend/src/main.jsx

import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./styles.css"

console.log(
  "%cInfraScribe.dev — Generates a complete DevOps bundle",
  "color: #22c55e; font-size: 14px; font-weight: bold;"
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
