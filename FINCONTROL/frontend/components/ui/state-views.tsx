"use client";

import React from "react";
import { ShieldIcon, AnomaliesIcon } from "./icons";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ size?: number; color?: string; className?: string }>;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = ShieldIcon,
}: EmptyStateProps) {
  return (
    <div
      className="panel"
      style={{
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--bg-surface-elevated)",
          border: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          color: "var(--text-secondary)",
        }}
      >
        <Icon size={20} color="currentColor" />
      </div>
      <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
        {title}
      </h3>
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "420px", lineHeight: "1.5", marginBottom: actionLabel ? "18px" : "0" }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-secondary" style={{ fontSize: "12.5px" }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Telemetry Data Unavailable",
  description = "The requested financial telemetry service could not be reached. Check network connection or retry.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="panel"
      style={{
        padding: "36px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid var(--semantic-critical-border)",
        background: "var(--semantic-critical-bg)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--semantic-critical-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
          color: "var(--semantic-critical-text)",
        }}
      >
        <AnomaliesIcon size={18} color="currentColor" />
      </div>
      <h3 style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
        {title}
      </h3>
      <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", maxWidth: "400px", lineHeight: "1.5", marginBottom: onRetry ? "16px" : "0" }}>
        {description}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary" style={{ fontSize: "12px", padding: "6px 14px" }}>
          Retry Telemetry Sync
        </button>
      )}
    </div>
  );
}
