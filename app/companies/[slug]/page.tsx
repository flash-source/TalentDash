import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatSalary, median } from "@/lib/salary";

interface LevelBadge { bg: string; color: string; label: string }

interface SalaryRecord {
  id: string;
  role: string;
  level: string;
  location: string | null;
  experience_years: number;
  base_salary: bigint;
  bonus: bigint;
  stock: bigint;
  total_compensation: bigint;
  currency: string;
  is_verified?: boolean;
}

export async function generateStaticParams() {
  try {
    const companies = await prisma.company.findMany({ select: { slug: true } });
    return companies.map((c: { slug: string }) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const company = await prisma.company.findUnique({ where: { slug } });
    if (!company) return {};
    return {
      title: `${company.name} Salaries & Compensation — All Levels`,
      description: `Explore salary data, level distribution, and compensation ranges at ${company.name}.`,
      alternates: { canonical: `/companies/${slug}` },
      openGraph: { title: `${company.name} Salaries | TalentDash`, url: `/companies/${slug}` },
    };
  } catch { return {}; }
}

const LEVEL_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  L3:        { bg: "#f1f5f9", color: "#475569", label: "L3"        },
  L4:        { bg: "#dbeafe", color: "#1d4ed8", label: "L4"        },
  L5:        { bg: "#e0e7ff", color: "#4338ca", label: "L5"        },
  L6:        { bg: "#f3e8ff", color: "#7e22ce", label: "L6"        },
  SDE_I:     { bg: "#f1f5f9", color: "#475569", label: "SDE-I"     },
  SDE_II:    { bg: "#dbeafe", color: "#1d4ed8", label: "SDE-II"    },
  SDE_III:   { bg: "#e0e7ff", color: "#4338ca", label: "SDE-III"   },
  STAFF:     { bg: "#f3e8ff", color: "#7e22ce", label: "Staff"     },
  PRINCIPAL: { bg: "#1e1b4b", color: "#fff",    label: "Principal" },
  IC4:       { bg: "#dbeafe", color: "#1d4ed8", label: "IC4"       },
  IC5:       { bg: "#e0e7ff", color: "#4338ca", label: "IC5"       },
};

const LEVEL_BAR_COLOR: Record<string, string> = {
  L3: "#94a3b8", L4: "#3b82f6", L5: "#6366f1", L6: "#a855f7",
  SDE_I: "#94a3b8", SDE_II: "#3b82f6", SDE_III: "#6366f1",
  STAFF: "#a855f7", PRINCIPAL: "#1e1b4b", IC4: "#3b82f6", IC5: "#6366f1",
};

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let company = null;

  try {
    company = await prisma.company.findUnique({
      where: { slug },
      include: { salaries: { orderBy: { total_compensation: "desc" } } },
    });
  } catch { notFound(); }

  if (!company) notFound();

  const salaries = company.salaries;
  const tcValues = salaries.map((s: { total_compensation: bigint }) => Number(s.total_compensation));
  const medianTC = median(tcValues);
  const minTC = tcValues.length ? Math.min(...tcValues) : 0;
  const maxTC = tcValues.length ? Math.max(...tcValues) : 0;

  const levelCounts: Record<string, number> = {};
  for (const s of salaries) levelCounts[s.level] = (levelCounts[s.level] ?? 0) + 1;
  const levelEntries = Object.entries(levelCounts).sort((a, b) => b[1] - a[1]);

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Organization",
    name: company.name,
    url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://talentdash.vercel.app"}/companies/${slug}`,
    foundingDate: company.founded_year?.toString(),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <div style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: "28px 32px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: "#222222", margin: "0 0 10px" }}>{company.name}</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              {company.industry && <span style={{ backgroundColor: "#F7F7F7", border: "1px solid #EBEBEB", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "#484848" }}>{company.industry}</span>}
              {company.headquarters && <span style={{ fontSize: 13, color: "#717171" }}>📍 {company.headquarters}</span>}
              {company.founded_year && <span style={{ fontSize: 13, color: "#717171" }}>🗓 Founded {company.founded_year}</span>}
              {company.headcount_range && <span style={{ fontSize: 13, color: "#717171" }}>👥 {company.headcount_range} employees</span>}
            </div>
          </div>
          <Link href={`/compare?c1=${slug}`} style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "#222222", textDecoration: "none" }}>
            ⚖️ Compare
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: "24px 20px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#717171", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Median Total Comp</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: "#0369A1", margin: "0 0 4px" }}>
            {salaries.length > 0 ? formatSalary(medianTC, "INR", "INR", true) : "—"}
          </p>
          <p style={{ fontSize: 12, color: "#717171", margin: 0 }}>per year</p>
        </div>
        <div style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: "24px 20px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#717171", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>TC Range</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#222222", margin: "0 0 4px" }}>
            {salaries.length > 0 ? `${formatSalary(minTC, "INR", "INR", true)} — ${formatSalary(maxTC, "INR", "INR", true)}` : "—"}
          </p>
          <p style={{ fontSize: 12, color: "#717171", margin: 0 }}>min to max</p>
        </div>
        <div style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: "24px 20px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#717171", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Data Points</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: "#222222", margin: "0 0 4px" }}>{salaries.length}</p>
          <p style={{ fontSize: 12, color: "#717171", margin: 0 }}>salary records</p>
        </div>
      </div>

      {/* Level distribution */}
      {salaries.length > 0 && (
        <div style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#222222", margin: "0 0 16px" }}>Level Distribution</h2>
          <div style={{ display: "flex", height: 24, borderRadius: 6, overflow: "hidden", marginBottom: 14 }}>
            {levelEntries.map(([level, count]) => (
              <div key={level}
                style={{ width: `${(count / salaries.length) * 100}%`, backgroundColor: LEVEL_BAR_COLOR[level] ?? "#94a3b8", minWidth: 2 }}
                title={`${LEVEL_BADGE[level]?.label ?? level}: ${count}`}
              />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {levelEntries.map(([level, count]) => {
              const badge = LEVEL_BADGE[level] ?? { bg: "#F7F7F7", color: "#484848", label: level };
              return (
                <div key={level} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <span style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 600, padding: "2px 8px", borderRadius: 4 }}>{badge.label}</span>
                  <span style={{ color: "#717171" }}>({count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Salary table */}
      <div style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #EBEBEB" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#222222", margin: 0 }}>All Salaries at {company.name}</h2>
        </div>
        {salaries.length === 0 ? (
          <div style={{ padding: "48px 32px", textAlign: "center", color: "#717171" }}>No salary records yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F7F7F7", borderBottom: "1px solid #EBEBEB" }}>
                  {["Role", "Level", "Location", "Exp", "Base Salary", "Bonus", "Stock", "Total Comp", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "#717171", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salaries.map((r: SalaryRecord) => {
                  const badge: LevelBadge = LEVEL_BADGE[r.level] ?? { bg: "#F7F7F7", color: "#484848", label: r.level };
                  const fmt = (n: bigint): string => Number(n) > 0 ? formatSalary(Number(n), r.currency, "INR", true) : "—";
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #EBEBEB" }}>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#222222", maxWidth: 220 }}>{r.role}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6 }}>{badge.label}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#484848" }}>{r.location}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#717171", textAlign: "center" }}>{r.experience_years}y</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#484848" }}>{fmt(r.base_salary)}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#484848" }}>{fmt(r.bonus)}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#484848" }}>{fmt(r.stock)}</td>
                      <td style={{ padding: "14px 16px", fontSize: 16, fontWeight: 800, color: "#0369A1", whiteSpace: "nowrap" }}>
                        {fmt(r.total_compensation)}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {r.is_verified && (
                          <span style={{ fontSize: 11, backgroundColor: "#E8F5E9", color: "#2E7D32", fontWeight: 600, padding: "2px 8px", borderRadius: 4 }}>✓ Verified</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}