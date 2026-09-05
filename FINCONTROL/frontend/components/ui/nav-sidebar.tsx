"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
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
} from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/", label: "Overview", icon: OverviewIcon },
  { href: "/ai-analyst", label: "AI Analyst", icon: AnalystIcon },
  { href: "/investigations", label: "Investigations", icon: InvestigationIcon },
  { href: "/anomalies", label: "Anomalies", icon: AnomaliesIcon },
  { href: "/revenue", label: "Revenue", icon: RevenueIcon },
  { href: "/payments", label: "Payments", icon: PaymentsIcon },
  { href: "/settlements", label: "Settlements", icon: SettlementsIcon },
  { href: "/cash-flow", label: "Cash Flow", icon: CashFlowIcon },
  { href: "/scenarios", label: "Scenarios", icon: ScenariosIcon },
  { href: "/alerts", label: "Alerts", icon: AlertsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">अ</div>
        <div>
          <h1 className="brand-title">Artha</h1>
          <div className="brand-badge">Financial Intelligence</div>
        </div>
      </div>

      <div className="sidebar-system-status">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="status-dot"></span>
          <span style={{ color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.04em", fontSize: "10.5px", fontFamily: "var(--font-mono)" }}>
            OPERATIONAL
          </span>
        </div>
        <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
          US-EAST
        </span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px" }}>
                <Icon size={15} color={isActive ? "var(--text-primary)" : "var(--text-secondary)"} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link href="/login" style={{ textDecoration: "none", color: "inherit", display: "block" }} title="Switch Account / Sign In">
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
  );
}
