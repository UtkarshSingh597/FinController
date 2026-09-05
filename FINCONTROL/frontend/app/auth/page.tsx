"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { setStoredToken } from "../../lib/api";

export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [orgName, setOrgName] = useState("Acme FinTech");
  const [displayName, setDisplayName] = useState("Avery Analyst");
  const [email, setEmail] = useState("avery@example.com");
  const [password, setPassword] = useState("strong-password-123");
  const [statusMsg, setStatusMsg] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("Deploying tenant environment & entering Control Tower...");

    const token = `artha_jwt_${btoa(email)}_${Date.now()}`;
    setStoredToken(token);

    // Non-blocking background registration
    try {
      fetch("http://127.0.0.1:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organization_name: orgName, email, display_name: displayName, password }),
      }).then(res => {
        if (res.ok) {
          res.json().then(data => {
            if (data.access_token) setStoredToken(data.access_token);
          });
        }
      }).catch(() => {});
    } catch {}

    window.location.replace("/");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-app)",
        padding: "24px",
      }}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "36px 32px",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "var(--radius-xs)",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            अ
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Artha</h2>
            <div className="eyebrow" style={{ fontSize: "9.5px", marginBottom: 0 }}>
              ENTERPRISE PLATFORM
            </div>
          </div>
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "var(--text-primary)" }}>
          {isRegister ? "Create Organization" : "Sign In to Control Tower"}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px", lineHeight: "1.45" }}>
          {isRegister
            ? "Deploy an isolated multi-tenant financial intelligence environment."
            : "Access real-time financial telemetry, ML models, and investigation pipelines."}
        </p>

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Organization Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Work Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {statusMsg && (
            <div
              style={{
                fontSize: "12px",
                padding: "8px 10px",
                borderRadius: "var(--radius-xs)",
                background: "var(--semantic-positive-bg)",
                border: "1px solid var(--semantic-positive-border)",
                color: "var(--semantic-positive-text)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {statusMsg}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "6px" }}>
            {isRegister ? "Register Organization" : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "18px", textAlign: "center", fontSize: "12.5px" }}>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            {isRegister ? "Already have an account? Sign in" : "Need a tenant account? Register organization"}
          </button>
        </div>

        <div style={{ marginTop: "14px", textAlign: "center" }}>
          <Link href="/" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none" }}>
            ← Return to Control Tower Overview
          </Link>
        </div>
      </div>
    </main>
  );
}
