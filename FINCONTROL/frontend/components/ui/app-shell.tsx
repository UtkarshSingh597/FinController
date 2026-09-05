"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  OverviewIcon,
  AnalystIcon,
  InvestigationIcon,
  AnomaliesIcon,
  RevenueIcon,
  PaymentsIcon,
  SettlementsIcon,
  CashFlowIcon,
  ScenariosIcon,
  AlertsIcon,
  SettingsIcon,
  SearchIcon,
  ArrowRightIcon,
} from "./icons";

interface AppShellProps {
  children: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: "COMMAND",
    items: [
      { href: "/", label: "Overview", icon: OverviewIcon },
      { href: "/ai-analyst", label: "AI Analyst", icon: AnalystIcon },
      { href: "/investigations", label: "Audit Registry", icon: InvestigationIcon },
    ],
  },
  {
    label: "TELEMETRY",
    items: [
      { href: "/anomalies", label: "ML Anomalies", icon: AnomaliesIcon },
      { href: "/revenue", label: "Revenue Trajectory", icon: RevenueIcon },
      { href: "/payments", label: "Payment Gateways", icon: PaymentsIcon },
      { href: "/settlements", label: "Settlement Payouts", icon: SettlementsIcon },
      { href: "/cash-flow", label: "Cash Flow Runway", icon: CashFlowIcon },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { href: "/scenarios", label: "Stress Simulator", icon: ScenariosIcon },
      { href: "/alerts", label: "Surveillance Feed", icon: AlertsIcon },
      { href: "/settings", label: "System & MCP", icon: SettingsIcon },
    ],
  },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Derive route title for topbar breadcrumb
  const currentTitle =
    pathname === "/"
      ? "Overview"
      : pathname?.startsWith("/ai-analyst")
      ? "AI Analyst"
      : pathname?.startsWith("/investigations")
      ? "Audit Registry"
      : pathname?.startsWith("/anomalies")
      ? "ML Anomalies"
      : pathname?.startsWith("/revenue")
      ? "Revenue Trajectory"
      : pathname?.startsWith("/payments")
      ? "Payment Gateways"
      : pathname?.startsWith("/settlements")
      ? "Settlement Payouts"
      : pathname?.startsWith("/cash-flow")
      ? "Cash Flow Runway"
      : pathname?.startsWith("/scenarios")
      ? "Stress Simulator"
      : pathname?.startsWith("/alerts")
      ? "Surveillance Feed"
      : pathname?.startsWith("/settings")
      ? "System & MCP"
      : "Control Tower";

  return (
    <div className="app-layout">
      {/* Sidebar Desktop */}
      <aside className={`sidebar ${mobileOpen ? "sidebar-mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">अ</div>
          <div>
            <h1 className="brand-title">Artha</h1>
            <div className="brand-badge">Financial Intelligence</div>
          </div>
        </div>

        <div className="sidebar-system-status">
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="status-dot"></span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.04em", fontSize: "10px", fontFamily: "var(--font-mono)" }}>
              SYSTEM OPERATIONAL
            </span>
          </div>
          <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
            US-EAST
          </span>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "9.5px",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.08em",
                  padding: "4px 10px 6px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {group.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`nav-link ${isActive ? "active" : ""}`}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "16px" }}>
                        <Icon size={14} color={isActive ? "var(--text-primary)" : "var(--text-secondary)"} />
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link href="/login" style={{ textDecoration: "none", color: "inherit", display: "block" }} title="Tenant Account">
            <div className="user-profile">
              <div className="user-avatar">AA</div>
              <div className="user-info">
                <div className="user-name">Avery Analyst</div>
                <div className="user-role">NovaPay FinTech · Owner</div>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Workspace with Topbar */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <header
          style={{
            height: "48px",
            borderBottom: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-primary)",
                cursor: "pointer",
                padding: "4px",
                display: "none",
              }}
            >
              ☰
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "var(--text-muted)" }}>Artha</span>
              <span style={{ color: "var(--border-default)" }}>/</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{currentTitle}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/ai-analyst"
              className="btn btn-secondary"
              style={{ padding: "4px 10px", fontSize: "11.5px", gap: "6px" }}
            >
              <SearchIcon size={12} color="currentColor" />
              <span>Query Books</span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>⌘K</span>
            </Link>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Tenant: <strong style={{ color: "var(--text-secondary)" }}>NovaPay</strong>
            </div>
          </div>
        </header>

        {/* Page Content with Fast Progressive Reveal */}
        <main className="main-content page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
