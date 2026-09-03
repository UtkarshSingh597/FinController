import "./styles.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artha (अर्थ) — Financial Intelligence Control Tower",
  description: "Enterprise Autonomous Financial Intelligence & Incident Investigation Platform",
};
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
