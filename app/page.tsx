import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatSalary } from "@/lib/salary";

export const revalidate = 3600;

const COMPANIES = [
  { name: "Google",    slug: "google",    emoji: "🔍" },
  { name: "Amazon",   slug: "amazon",    emoji: "📦" },
  { name: "Meta",     slug: "meta",      emoji: "👾" },
  { name: "Microsoft",slug: "microsoft", emoji: "🪟" },
  { name: "Flipkart", slug: "flipkart",  emoji: "🛒" },
  { name: "Razorpay", slug: "razorpay",  emoji: "💳" },
  { name: "NVIDIA",   slug: "nvidia",    emoji: "🎮" },
  { name: "Meesho",   slug: "meesho",    emoji: "🛍️" },
  { name: "TCS",      slug: "tcs",       emoji: "🏢" },
  { name: "Infosys",  slug: "infosys",   emoji: "💼" },
  { name: "Zepto",    slug: "zepto",     emoji: "⚡" },
  { name: "Wipro",    slug: "wipro",     emoji: "🌐" },
];

const LEVEL_BADGE: Record<string, { bg: string; color: string }> = {
  L3: { bg: "#f1f5f9", color: "#475569" }, L4: { bg: "#dbeafe", color: "#1d4ed8" },
  L5: { bg: "#e0e7ff", color: "#4338ca" }, L6: { bg: "#f3e8ff", color: "#7e22ce" },
  SDE_I: { bg: "#f1f5f9", color: "#475569" }, SDE_II: { bg: "#dbeafe", color: "#1d4ed8" },
  SDE_III: { bg: "#e0e7ff", color: "#4338ca" }, STAFF: { bg: "#f3e8ff", color: "#7e22ce" },
  PRINCIPAL: { bg: "#1e1b4b", color: "#fff" }, IC4: { bg: "#dbeafe", color: "#1d4ed8" },
  IC5: { bg: "#e0e7ff", color: "#4338ca" },
};

function LevelChip({ level }: { level: string }) {
  const s = LEVEL_BADGE[level] ?? { bg: "#F7F7F7", color: "#484848" };
  return (
    <span style={{ backgroundColor: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, whiteSpace: "nowrap" }}>
      {level.replace("_", "-")}
    </span>
  );
}

export default async function HomePage() {
  let salaryCount = 0, companyCount = 0;
  let topRecords: Array<{
    id: string; role: string; level: string; location: string; currency: string;
    total_compensation: bigint; company: { name: string; slug: string };
  }> = [];

  try {
    [salaryCount, companyCount, topRecords] = await Promise.all([
      prisma.salary.count(),
      prisma.company.count(),
      prisma.salary.findMany({ take: 6, orderBy: { total_compensation: "desc" }, include: { company: true } }),
    ]);
  } catch { /* DB not seeded yet */ }

  const stats = [
    { label: "Salary Records", value: salaryCount > 0 ? `${salaryCount}` : "60+",  suffix: "" },
    { label: "Companies",      value: companyCount > 0 ? `${companyCount}` : "12", suffix: "" },
    { label: "Cities Covered", value: "8",   suffix: "+" },
    { label: "Roles Tracked",  value: "12",  suffix: "+" },
  ];

  const notSeeded = salaryCount === 0;

  return (
    <div>

      {notSeeded && (
        <div style={{ backgroundColor: "#FFF8E1", border: "1px solid #FFB400", borderRadius: 10, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#7A5200" }}>⚠️ Database is empty.</span>
            <span style={{ fontSize: 13, color: "#7A5200", marginLeft: 8 }}>Click the button to seed 60+ salary records instantly.</span>
          </div>
          <SeedButton />
        </div>
      )}

      <div className="anim-fade-up" style={{ textAlign: "center", padding: "72px 0 56px", position: "relative", overflow: "hidden" }}>
        {/* Subtle background gradient blobs */}
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse at center, rgba(255,90,95,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="anim-fade-up" style={{ display: "inline-block", backgroundColor: "#FFF0F0", color: "#FF5A5F", fontSize: 13, fontWeight: 600, padding: "6px 16px", borderRadius: 20, marginBottom: 24, border: "1px solid rgba(255,90,95,0.2)" }}>
          🇮🇳 India&apos;s Compensation Intelligence Platform
        </div>

        <h1 className="anim-fade-up-1" style={{ fontSize: 56, fontWeight: 800, color: "#222222", lineHeight: 1.08, maxWidth: 720, margin: "0 auto 20px", letterSpacing: "-1px" }}>
          Know exactly what<br />
          you&apos;re worth.{" "}
          <span style={{ color: "#FF5A5F", position: "relative", display: "inline-block" }}>
            Before you negotiate.
            {/* Underline accent */}
            <span style={{ position: "absolute", bottom: -4, left: 0, right: 0, height: 3, backgroundColor: "#FF5A5F", borderRadius: 2, opacity: 0.3 }} />
          </span>
        </h1>

        <p className="anim-fade-up-2" style={{ fontSize: 18, color: "#484848", maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Structured, level-aware salary data for tech professionals in India.
          Real numbers from real people — no paywalls.
        </p>

        <div className="anim-fade-up-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/salaries" style={{ backgroundColor: "#FF5A5F", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 10, textDecoration: "none", boxShadow: "0 4px 14px rgba(255,90,95,0.35)", transition: "all 0.2s" }}>
            Explore Salaries →
          </Link>
          <Link href="/compare" style={{ backgroundColor: "#fff", color: "#222222", fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 10, border: "1.5px solid #EBEBEB", textDecoration: "none" }}>
            Compare Offers
          </Link>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
          {["Level-aware data", "India-first", "No paywalls", "Server-computed TC"].map((tag) => (
            <span key={tag} style={{ fontSize: 12, color: "#717171", backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 20, padding: "4px 14px", fontWeight: 500 }}>
              ✓ {tag}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 48 }}>
        {stats.map((s, i) => (
          <div key={s.label} className="stat-card" style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: "28px 20px", textAlign: "center", position: "relative", overflow: "hidden", animationDelay: `${i * 0.05}s` }}>
            {/* Accent bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #FF5A5F, #ff8f92)" }} />
            <p style={{ fontSize: 40, fontWeight: 800, color: "#FF5A5F", margin: 0, lineHeight: 1 }}>{s.value}<span style={{ fontSize: 24 }}>{s.suffix}</span></p>
            <p style={{ fontSize: 13, color: "#717171", margin: "8px 0 0", fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="anim-fade-up" style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: 32, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#222222", margin: 0 }}>Browse by Company</h2>
          <span style={{ fontSize: 12, color: "#717171", fontWeight: 500 }}>{companyCount || 12} companies</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {COMPANIES.map((c) => (
            <Link key={c.slug} href={`/companies/${c.slug}`} className="company-pill"
              style={{ backgroundColor: "#F7F7F7", border: "1px solid #EBEBEB", borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 500, color: "#222222", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{c.emoji}</span> {c.name}
            </Link>
          ))}
        </div>
      </div>

      {topRecords.length > 0 && (
        <div className="anim-fade-up" style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #EBEBEB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#222222", margin: 0 }}>🏆 Top Compensation Records</h2>
            <Link href="/salaries" style={{ fontSize: 13, color: "#FF5A5F", textDecoration: "none", fontWeight: 500 }}>View all →</Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F7F7F7", borderBottom: "1px solid #EBEBEB" }}>
                  {["Company", "Role", "Level", "Location", "Total Comp"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "#717171", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topRecords.map((r) => (
                  <tr key={r.id} className="table-row-hover" style={{ borderBottom: "1px solid #EBEBEB", transition: "background 0.15s" }}>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600 }}>
                      <Link href={`/companies/${r.company.slug}`} style={{ color: "#222222", textDecoration: "none" }}>{r.company.name}</Link>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#484848" }}>{r.role}</td>
                    <td style={{ padding: "14px 16px" }}><LevelChip level={r.level} /></td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#484848" }}>{r.location}</td>
                    <td style={{ padding: "14px 16px", fontSize: 17, fontWeight: 800, color: "#0369A1" }}>
                      {formatSalary(Number(r.total_compensation), r.currency, "INR", true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { icon: "🎯", title: "Level-Aware Data", desc: "Every record tagged with standardised levels — L3 to Principal. Compare apples to apples." },
          { icon: "💰", title: "Real Total Comp", desc: "Base + bonus + stock, always computed server-side. Nobody games the data." },
          { icon: "🇮🇳", title: "India-First", desc: "Deep coverage of Bengaluru, Hyderabad, Mumbai, Pune. Not just Bay Area salaries." },
        ].map((f) => (
          <div key={f.title} className="anim-fade-up" style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#222222", margin: "0 0 8px" }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: "#717171", margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "linear-gradient(135deg, #222222 0%, #1a1a2e 100%)", borderRadius: 16, padding: "52px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>

        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(255,90,95,0.15)" }} />
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(255,90,95,0.1)" }} />

        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 12, marginTop: 0, position: "relative" }}>
          Got an offer? Find out if it&apos;s fair.
        </h2>
        <p style={{ color: "#aaaaaa", fontSize: 16, marginBottom: 28, position: "relative" }}>
          Compare your offer against real data from engineers who&apos;ve been there.
        </p>
        <Link href="/compare" style={{ backgroundColor: "#FF5A5F", color: "#fff", fontWeight: 700, padding: "14px 32px", borderRadius: 10, textDecoration: "none", fontSize: 15, boxShadow: "0 4px 14px rgba(255,90,95,0.4)", position: "relative" }}>
          Compare Now →
        </Link>
      </div>
    </div>
  );
}

function SeedButton() {
  return (
    <a href="/api/seed" target="_blank" rel="noopener noreferrer"
      style={{ backgroundColor: "#FF5A5F", color: "#fff", fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 8, textDecoration: "none", whiteSpace: "nowrap" }}>
      Seed Database →
    </a>
  );
}