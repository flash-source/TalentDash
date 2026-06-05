import { Suspense } from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SalaryTableRow } from "@/components/features/SalaryTableRow";
import { SalaryFilters } from "@/components/features/SalaryFilters";
import { Pagination } from "@/components/ui/Pagination";
import { DisplayCurrency, SalaryRecord } from "@/types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tech Salaries in India — All Levels & Companies",
  description: "Browse verified salary data for engineers, PMs, and data scientists across Google, Amazon, Flipkart and more.",
  alternates: { canonical: "/salaries" },
  openGraph: { title: "Tech Salaries in India | TalentDash", url: "/salaries" },
};

const LIMIT = 25;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getSalaries(sp: Record<string, string | string[] | undefined>) {
  const company  = typeof sp.company  === "string" ? sp.company  : undefined;
  const role     = typeof sp.role     === "string" ? sp.role     : undefined;
  const level    = typeof sp.level    === "string" ? sp.level    : undefined;
  const location = typeof sp.location === "string" ? sp.location : undefined;
  const currency = typeof sp.currency === "string" ? sp.currency : undefined;
  const sort     = typeof sp.sort     === "string" ? sp.sort     : "total_comp_desc";
  const page     = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10));

  const where: Record<string, any> = {};
  if (company)  where.company = { normalized_name: { contains: company.toLowerCase(), mode: "insensitive" } };
  if (role)     where.role = { contains: role, mode: "insensitive" };
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (currency) where.currency = currency as never;
  if (level) {
    const levels = level.split(",").filter(Boolean);
    where.level = levels.length === 1 ? (levels[0] as never) : { in: levels as never[] };
  }

  let orderBy: Record<string, "asc" | "desc">;
  switch (sort) {
    case "total_comp_asc": orderBy = { total_compensation: "asc" };  break;
    case "date_desc":      orderBy = { submitted_at: "desc" };       break;
    default:               orderBy = { total_compensation: "desc" };
  }

  const [total, records] = await Promise.all([
    prisma.salary.count({ where }),
    prisma.salary.findMany({ where, orderBy, skip: (page - 1) * LIMIT, take: LIMIT, include: { company: true } }),
  ]);

  const data: SalaryRecord[] = records.map((r: any) => ({
    id: r.id, company_id: r.company_id,
    company_slug: r.company.slug, company_name: r.company.name,
    role: r.role, level: r.level as never, location: r.location,
    currency: r.currency as never, experience_years: r.experience_years,
    base_salary: Number(r.base_salary), bonus: Number(r.bonus),
    stock: Number(r.stock), total_compensation: Number(r.total_compensation),
    source: r.source as never, confidence_score: Number(r.confidence_score),
    is_verified: r.is_verified, submitted_at: r.submitted_at.toISOString(),
  }));

  return { data, total, page, totalPages: Math.ceil(total / LIMIT) };
}

export default async function SalariesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { data, total, page, totalPages } = await getSalaries(sp);
  const displayCurrency: DisplayCurrency = sp.currency === "USD" ? "USD" : "INR";
  const sortParam = typeof sp.sort === "string" ? sp.sort : "total_comp_desc";

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Dataset",
    name: "TalentDash India Salary Dataset",
    description: "Structured salary data for tech professionals in India.",
    url: "https://talentdash.in/salaries",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#222222] mb-1">Tech Salaries in India</h1>
        <p className="text-[#717171] text-sm">{total.toLocaleString()} verified records · Updated continuously</p>
      </div>

      <Suspense><SalaryFilters initialCurrency={displayCurrency} /></Suspense>

      <div className="flex justify-end mb-3 gap-2">
        {[["total_comp_desc","TC ↓"],["total_comp_asc","TC ↑"],["date_desc","Newest"]].map(([val, label]) => (
          <a key={val} href={`/salaries?sort=${val}`}
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${sortParam === val ? "bg-[#222222] text-white border-[#222222]" : "bg-white text-[#484848] border-[#EBEBEB] hover:border-[#222222]"}`}>
            {label}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#EBEBEB] overflow-hidden">
        {data.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#484848] mb-2">No records found for these filters.</p>
            <a href="/salaries" className="text-sm text-[#FF5A5F] hover:underline">Clear all filters</a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F7F7] border-b border-[#EBEBEB]">
                  {["Company","Role","Level","Location","Exp","Base Salary","Stock","Total Comp"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-[#717171] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((record) => (
                  <SalaryTableRow key={record.id} record={record} displayCurrency={displayCurrency} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Suspense><Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} /></Suspense>
    </>
  );
}