"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/", label: "Overview", icon: "❖" },
  { href: "/ai-analyst", label: "AI Analyst", icon: "✦" },
  { href: "/investigations", label: "Investigations", icon: "⌕" },
  { href: "/anomalies", label: "Anomalies", icon: "⚠" },
  { href: "/revenue", label: "Revenue", icon: "↗" },
  { href: "/payments", label: "Payments", icon: "💳" },
  { href: "/settlements", label: "Settlements", icon: "⇄" },
  { href: "/cash-flow", label: "Cash Flow", icon: "◈" },
  { href: "/scenarios", label: "Scenarios", icon: "⚡" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">F</div>
        <div>
          <h1 className="brand-title">FINCONTROL</h1>
          <div className="brand-badge">FINANCIAL CONTROL TOWER</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <span style={{ fontSize: "14px", width: "16px", textAlign: "center" }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">AA</div>
          <div className="user-info">
            <div className="user-name">Avery Analyst</div>
            <div className="user-role">Acme FinTech · Owner</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
