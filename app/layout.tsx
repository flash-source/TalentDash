import type { Metadata } from "next";
import { Inter } from "next/font/google";

import './globals.css';
import Link from "next/link";
import { AnimatedCursor } from "@/components/ui/AnimatedCursor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "TalentDash — India Salary & Career Intelligence",
    template: "%s | TalentDash",
  },
  description:
    "Structured compensation data for tech professionals in India. Compare salaries, research companies, and make informed career decisions.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://talentdash.vercel.app"
  ),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: "#F7F7F7", color: "#222222", margin: 0 }}>
        <AnimatedCursor />

        {/* Navbar */}
        <header style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #EBEBEB",
          position: "sticky", top: 0, zIndex: 40,
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ fontSize: 18, fontWeight: 700, color: "#222222", textDecoration: "none", letterSpacing: "-0.3px" }}>
              Talent<span style={{ color: "#FF5A5F" }}>Dash</span>
            </Link>
            <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
              <Link href="/salaries"          style={{ fontSize: 14, color: "#484848", textDecoration: "none" }}>Salaries</Link>
              <Link href="/companies/google"  style={{ fontSize: 14, color: "#484848", textDecoration: "none" }}>Companies</Link>
              <Link href="/compare"           style={{ fontSize: 14, color: "#484848", textDecoration: "none" }}>Compare</Link>
              <Link href="/salaries" style={{
                fontSize: 13, fontWeight: 600,
                backgroundColor: "#FF5A5F", color: "#fff",
                padding: "8px 16px", borderRadius: 8, textDecoration: "none",
              }}>
                Explore Salaries
              </Link>
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
          {children}
        </main>

        <footer style={{ borderTop: "1px solid #EBEBEB", backgroundColor: "#fff", marginTop: 64 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#222222" }}>
              Talent<span style={{ color: "#FF5A5F" }}>Dash</span>
            </span>
            <div style={{ display: "flex", gap: 24 }}>
              <Link href="/salaries" style={{ fontSize: 13, color: "#717171", textDecoration: "none" }}>Salaries</Link>
              <Link href="/compare"  style={{ fontSize: 13, color: "#717171", textDecoration: "none" }}>Compare</Link>
            </div>
            <p style={{ fontSize: 12, color: "#717171", margin: 0 }}>© 2025 TalentDash. Built for India&apos;s tech community.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}