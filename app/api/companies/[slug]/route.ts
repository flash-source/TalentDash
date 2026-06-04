import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { median } from "@/lib/salary";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    include: { salaries: { orderBy: { total_compensation: "desc" } } },
  });

  if (!company) return NextResponse.json({ error: true, message: "Company not found" }, { status: 404 });

  const tcValues = company.salaries.map((s: (typeof company.salaries)[number]) => Number(s.total_compensation));
  const median_total_compensation = median(tcValues);

  const level_distribution: Record<string, number> = {};
  for (const s of company.salaries) level_distribution[s.level] = (level_distribution[s.level] ?? 0) + 1;

  const salaries = company.salaries.map((r: (typeof company.salaries)[number]) => ({
    id: r.id, company_id: r.company_id,
    company_slug: company.slug, company_name: company.name,
    role: r.role, level: r.level, location: r.location, currency: r.currency,
    experience_years: r.experience_years,
    base_salary: Number(r.base_salary), bonus: Number(r.bonus),
    stock: Number(r.stock), total_compensation: Number(r.total_compensation),
    source: r.source, confidence_score: Number(r.confidence_score),
    is_verified: r.is_verified, submitted_at: r.submitted_at.toISOString(),
  }));

  const response = NextResponse.json({
    id: company.id, name: company.name, slug: company.slug,
    normalized_name: company.normalized_name, industry: company.industry,
    headquarters: company.headquarters, founded_year: company.founded_year,
    headcount_range: company.headcount_range,
    created_at: company.created_at.toISOString(), updated_at: company.updated_at.toISOString(),
    salaries, median_total_compensation, level_distribution, salary_count: salaries.length,
  });

  response.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  return response;
}