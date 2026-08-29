import "./styles.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "FINCONTROL", description: "Financial intelligence" };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
