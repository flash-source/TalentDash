import Link from "next/link";
export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "96px 32px" }}>
      <h1 style={{ fontSize: 72, fontWeight: 800, color: "#222222", margin: "0 0 12px" }}>404</h1>
      <p style={{ fontSize: 18, color: "#484848", marginBottom: 24 }}>Company not found.</p>
      <Link href="/salaries" style={{ fontSize: 14, color: "#FF5A5F", textDecoration: "none" }}>Browse all salaries →</Link>
    </div>
  );
}