import React from "react";

export type BadgeType = "fact" | "prediction" | "hypothesis" | "simulation" | "critical" | "high" | "moderate" | "low";

interface BadgeProps {
  type: BadgeType | string;
  children?: React.ReactNode;
}

export function Badge({ type, children }: BadgeProps) {
  const normalized = type.toLowerCase() as BadgeType;
  const badgeClass = `badge badge-${normalized}`;
  const label = children ?? type.toUpperCase();

  return <span className={badgeClass}>{label}</span>;
}
