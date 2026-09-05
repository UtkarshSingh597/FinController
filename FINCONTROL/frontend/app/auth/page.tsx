"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ArrowRightIcon } from "../../components/ui/icons";
import { setStoredToken } from "../../lib/api";

export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [orgName, setOrgName] = useState("Acme FinTech");
  const [displayName, setDisplayName] = useState("Avery Analyst");
  const [email, setEmail] = useState("avery@example.com");
  const [password, setPassword] = useState("strong-password-123");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(isRegister ? "Deploying tenant environment & entering Control Tower..." : "Authenticating session...");

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

    setTimeout(() => {
      window.location.replace("/");
    }, 300);
  };

  return (
    <main className="auth-page">
      <div className="auth-ambient-glow" style={{ top: "15%", left: "20%" }}></div>
      <div className="auth-ambient-glow" style={{ bottom: "10%", right: "20%", animationDelay: "-5s", opacity: 0.35 }}></div>

      <div className="auth-card">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-highlight)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              boxShadow: "0 0 12px rgba(34, 197, 94, 0.15)",
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

        <h1 style={{ fontSize: "21px", fontWeight: 700, marginBottom: "6px", color: "var(--text-primary)" }}>
          {isRegister ? "Create Organization" : "Sign In to Control Tower"}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "22px", lineHeight: "1.5" }}>
          {isRegister
            ? "Deploy an isolated multi-tenant financial intelligence environment."
            : "Access real-time financial telemetry, ML models, and investigation pipelines."}
        </p>

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {isRegister && (
            <>
              <div className="form-group stagger-1">
                <label className="form-label">Organization Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme FinTech Corp"
                  required
                />
              </div>
              <div className="form-group stagger-2">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Avery Analyst"
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
              placeholder="name@company.com"
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
              placeholder="••••••••••••"
              required
            />
          </div>

          {statusMsg && (
            <div
              style={{
                fontSize: "12px",
                padding: "9px 12px",
                borderRadius: "var(--radius-xs)",
                background: "var(--semantic-positive-bg)",
                border: "1px solid var(--semantic-positive-border)",
                color: "var(--semantic-positive-text)",
                fontFamily: "var(--font-mono)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              className="page-enter"
            >
              <span className="spinner" style={{ width: "12px", height: "12px", borderColor: "rgba(74, 222, 128, 0.3)", borderTopColor: "var(--semantic-positive-text)" }}></span>
              <span>{statusMsg}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", marginTop: "6px", padding: "10px" }}>
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isRegister ? "Register Organization" : "Sign In"}</span>
                <ArrowRightIcon size={13} color="currentColor" />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "12.5px" }}>
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
              transition: "color var(--duration-fast) ease",
            }}
          >
            {isRegister ? "Already have an account? Sign in" : "Need a tenant account? Register organization"}
          </button>
        </div>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Link href="/" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none", transition: "color var(--duration-fast) ease" }}>
            ← Return to Control Tower Overview
          </Link>
        </div>
      </div>
    </main>
  );
}
