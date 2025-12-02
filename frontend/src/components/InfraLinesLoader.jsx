// src/components/InfraLinesLoader.jsx
import React from "react";
import "./InfraLinesLoader.css"; // or add to your global CSS

const InfraLinesLoader = () => {
  return (
    <div className="infra-loader">
      {/* central node */}
      <div className="infra-node infra-node--center" />

      {/* orbit / glow around center */}
      <div className="infra-orbit" />

      {/* peripheral nodes */}
      <div className="infra-node infra-node--t1" />
      <div className="infra-node infra-node--t2" />
      <div className="infra-node infra-node--r1" />
      <div className="infra-node infra-node--r2" />
      <div className="infra-node infra-node--b1" />
      <div className="infra-node infra-node--b2" />
      <div className="infra-node infra-node--l1" />
      <div className="infra-node infra-node--l2" />

      {/* lines */}
      <div className="infra-line infra-line--t1" />
      <div className="infra-line infra-line--t2" />
      <div className="infra-line infra-line--r1" />
      <div className="infra-line infra-line--r2" />
      <div className="infra-line infra-line--b1" />
      <div className="infra-line infra-line--b2" />
      <div className="infra-line infra-line--l1" />
      <div className="infra-line infra-line--l2" />
    </div>
  );
};

export default InfraLinesLoader;
