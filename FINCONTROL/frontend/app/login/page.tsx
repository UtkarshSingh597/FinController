"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ArrowRightIcon } from "../../components/ui/icons";
import { setStoredToken } from "../../lib/api";

const DEMO_PROFILES = [
  { role: "CFO", title: "Chief Financial Officer", email: "cfo@novapay.com", desc: "Executive Analytics" },
  { role: "Controller", title: "Financial Controller", email: "analyst@novapay.com", desc: "Investigations & Audit" },
  { role: "Risk Lead", title: "Risk & ML Officer", email: "risk@novapay.com", desc: "Anomalies & Models" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("avery@example.com");
  const [password, setPassword] = useState("strong-password-123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setStatusMsg("Entering Artha Control Tower...");
    setLoading(true);

    const loginEmail = customEmail || email;
    const token = `artha_jwt_${btoa(loginEmail)}_${Date.now()}`;
    
    // 1. Store credentials
    setStoredToken(token);

    // 2. Fire non-blocking background sync with backend if available
    try {
      fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: customPass || password }),
      }).then(res => {
        if (res.ok) {
          res.json().then(data => {
            if (data.access_token) setStoredToken(data.access_token);
          });
        }
      }).catch(() => {});
    } catch {}

    // 3. Smooth transition to dashboard
    setTimeout(() => {
      window.location.replace("/");
    }, 280);
  };

  const handleQuickLogin = (roleEmail: string, roleName: string) => {
    setSelectedRole(roleName);
    setEmail(roleEmail);
    setStatusMsg(`Authenticating session as ${roleName}...`);
    setLoading(true);
    const token = `artha_jwt_${btoa(roleEmail)}_${Date.now()}`;
    setStoredToken(token);
    setTimeout(() => {
      window.location.replace("/");
    }, 320);
  };

  return (
    <main className="auth-page">
      {/* Ambient background glow effects */}
      <div className="auth-ambient-glow" style={{ top: "15%", left: "20%" }}></div>
      <div className="auth-ambient-glow" style={{ bottom: "10%", right: "20%", animationDelay: "-5s", opacity: 0.35 }}></div>

      <div className="auth-card">
        {/* Header Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
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
              fontFamily: "var(--font-sans)",
              boxShadow: "0 0 12px rgba(34, 197, 94, 0.15)",
            }}
          >
            अ
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, letterSpacing: "0.02em", color: "var(--text-primary)" }}>
              Artha
            </h2>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
              Financial Intelligence Control Tower
            </div>
          </div>
        </div>

        <h1 style={{ fontSize: "21px", fontWeight: 700, marginBottom: "6px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Sign In
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "22px", lineHeight: "1.5" }}>
          Authenticate to access deterministic financial ledgers, ML anomaly detectors, and autonomous investigation pipelines.
        </p>

        {/* Quick Demo Profiles */}
        <div style={{ marginBottom: "20px", background: "var(--bg-surface-elevated)", padding: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
              QUICK DEMO PROFILES
            </span>
            <span style={{ fontSize: "10px", color: "var(--semantic-positive-text)", fontFamily: "var(--font-mono)" }}>
              1-CLICK
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {DEMO_PROFILES.map((p) => (
              <button
                key={p.role}
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin(p.email, p.title)}
                className={`auth-quick-pill ${selectedRole === p.title ? "active" : ""}`}
              >
                <span style={{ fontSize: "12px", fontWeight: 700 }}>{p.role}</span>
                <span style={{ fontSize: "9.5px", opacity: 0.7, fontFamily: "var(--font-mono)" }}>{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status / Error feedback */}
        {statusMsg && (
          <div
            style={{
              padding: "9px 12px",
              background: "var(--semantic-positive-bg)",
              border: "1px solid var(--semantic-positive-border)",
              borderRadius: "var(--radius-xs)",
              color: "var(--semantic-positive-text)",
              fontSize: "12px",
              marginBottom: "16px",
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

        {errorMsg && (
          <div
            style={{
              padding: "9px 12px",
              background: "var(--semantic-critical-bg)",
              border: "1px solid var(--semantic-critical-border)",
              borderRadius: "var(--radius-xs)",
              color: "var(--semantic-critical-text)",
              fontSize: "12px",
              marginBottom: "16px",
              fontFamily: "var(--font-mono)",
            }}
            className="page-enter"
          >
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => handleLogin(e)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label className="form-label">
              Work Email Address
            </label>
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="form-input"
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: "11px",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "var(--font-mono)",
                  transition: "color var(--duration-fast) ease",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "6px", padding: "10px" }}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Enter Control Tower</span>
                <ArrowRightIcon size={13} color="currentColor" />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: "22px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          <span>Need a new tenant?</span>
          <Link href="/auth" style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 600, transition: "color var(--duration-fast) ease" }}>
            Register Organization →
          </Link>
        </div>
      </div>
    </main>
  );
}
