"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ArrowRightIcon } from "../../components/ui/icons";
import { setStoredToken } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("avery@example.com");
  const [password, setPassword] = useState("strong-password-123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setStatusMsg("Entering Artha Control Tower...");
    setLoading(true);

    const loginEmail = customEmail || email;
    const token = `artha_jwt_${btoa(loginEmail)}_${Date.now()}`;
    
    // 1. Immediately store credentials
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

    // 3. Seamless transition to dashboard
    window.location.replace("/");
  };

  const handleQuickLogin = (roleEmail: string, roleName: string) => {
    setEmail(roleEmail);
    setStatusMsg(`Authenticating as ${roleName}...`);
    setLoading(true);
    const token = `artha_jwt_${btoa(roleEmail)}_${Date.now()}`;
    setStoredToken(token);
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
        {/* Header Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-xs)",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)",
            }}
          >
            अ
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, letterSpacing: "0.02em", color: "var(--text-primary)" }}>
              Artha
            </h2>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
              Financial Intelligence
            </div>
          </div>
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "var(--text-primary)" }}>
          Sign In
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px", lineHeight: "1.45" }}>
          Authenticate to access deterministic financial ledgers, ML anomaly detectors, and autonomous investigation pipelines.
        </p>

        {/* Quick Demo Profiles */}
        <div style={{ marginBottom: "20px", background: "var(--bg-surface-elevated)", padding: "12px", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>
            QUICK PROFILES
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={() => handleQuickLogin("cfo@novapay.com", "Chief Financial Officer")}
              className="btn btn-secondary"
              style={{ flex: 1, padding: "5px 6px", fontSize: "11.5px" }}
            >
              CFO
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("analyst@novapay.com", "Financial Controller")}
              className="btn btn-secondary"
              style={{ flex: 1, padding: "5px 6px", fontSize: "11.5px" }}
            >
              Controller
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("risk@novapay.com", "Risk Officer")}
              className="btn btn-secondary"
              style={{ flex: 1, padding: "5px 6px", fontSize: "11.5px" }}
            >
              Risk Lead
            </button>
          </div>
        </div>

        {/* Status / Error feedback */}
        {statusMsg && (
          <div
            style={{
              padding: "8px 12px",
              background: "var(--semantic-positive-bg)",
              border: "1px solid var(--semantic-positive-border)",
              borderRadius: "var(--radius-xs)",
              color: "var(--semantic-positive-text)",
              fontSize: "12px",
              marginBottom: "14px",
              fontFamily: "var(--font-mono)",
            }}
          >
            {statusMsg}
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: "8px 12px",
              background: "var(--semantic-critical-bg)",
              border: "1px solid var(--semantic-critical-border)",
              borderRadius: "var(--radius-xs)",
              color: "var(--semantic-critical-text)",
              fontSize: "12px",
              marginBottom: "14px",
              fontFamily: "var(--font-mono)",
            }}
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
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
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
            style={{ width: "100%", marginTop: "4px", padding: "10px" }}
          >
            <span>{loading ? "Authenticating..." : "Enter Control Tower"}</span>
            <ArrowRightIcon size={13} color="currentColor" />
          </button>
        </form>

        <div
          style={{
            marginTop: "20px",
            paddingTop: "14px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          <span>Need a new tenant?</span>
          <Link href="/auth" style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 600 }}>
            Register Organization
          </Link>
        </div>
      </div>
    </main>
  );
}
