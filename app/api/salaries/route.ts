import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const company  = searchParams.get("company")  ?? undefined;
  const role     = searchParams.get("role")     ?? undefined;
  const level    = searchParams.get("level")    ?? undefined;
  const location = searchParams.get("location") ?? undefined;
  const currency = searchParams.get("currency") ?? undefined;
  const sort     = searchParams.get("sort")     ?? "total_comp_desc";
  const page     = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit    = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)));

  const where: Prisma.SalaryWhereInput = {};
  if (company)  where.company = { normalized_name: { contains: company.toLowerCase(), mode: "insensitive" } };
  if (role)     where.role = { contains: role, mode: "insensitive" };
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (currency) where.currency = currency as never;
  if (level) {
    const levels = level.split(",").map((l) => l.trim()).filter(Boolean);
    where.level = levels.length === 1 ? (levels[0] as never) : { in: levels as never[] };
  }

  let orderBy: Prisma.SalaryOrderByWithRelationInput;
  switch (sort) {
    case "total_comp_asc": orderBy = { total_compensation: "asc" };  break;
    case "date_desc":      orderBy = { submitted_at: "desc" };       break;
    default:               orderBy = { total_compensation: "desc" };
  }

  const [total, records] = await Promise.all([
    prisma.salary.count({ where }),
    prisma.salary.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: { company: true } }),
  ]);

  const data = records.map((r: typeof records[0]) => ({
    id: r.id, company_id: r.company_id,
    company_slug: r.company.slug, company_name: r.company.name,
    role: r.role, level: r.level, location: r.location, currency: r.currency,
    experience_years: r.experience_years,
    base_salary: Number(r.base_salary), bonus: Number(r.bonus),
    stock: Number(r.stock), total_compensation: Number(r.total_compensation),
    source: r.source, confidence_score: Number(r.confidence_score),
    is_verified: r.is_verified, submitted_at: r.submitted_at.toISOString(),
  }));

  const response = NextResponse.json({ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  response.headers.set("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
  return response;
}