import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const s1 = req.nextUrl.searchParams.get("s1");
  const s2 = req.nextUrl.searchParams.get("s2");

  if (!s1 || !s2) return NextResponse.json({ error: true, message: "Both s1 and s2 are required" }, { status: 400 });
  if (s1 === s2)  return NextResponse.json({ error: true, message: "s1 and s2 must be different IDs" }, { status: 400 });

  const [record1, record2] = await Promise.all([
    prisma.salary.findUnique({ where: { id: s1 }, include: { company: true } }),
    prisma.salary.findUnique({ where: { id: s2 }, include: { company: true } }),
  ]);

  if (!record1) return NextResponse.json({ error: true, message: `Salary record not found: ${s1}` }, { status: 404 });
  if (!record2) return NextResponse.json({ error: true, message: `Salary record not found: ${s2}` }, { status: 404 });

  const serialize = (r: typeof record1) => ({
    id: r.id, company_id: r.company_id,
    company_slug: r.company.slug, company_name: r.company.name,
    role: r.role, level: r.level, location: r.location, currency: r.currency,
    experience_years: r.experience_years,
    base_salary: Number(r.base_salary), bonus: Number(r.bonus),
    stock: Number(r.stock), total_compensation: Number(r.total_compensation),
    source: r.source, confidence_score: Number(r.confidence_score),
    is_verified: r.is_verified, submitted_at: r.submitted_at.toISOString(),
  });

  const r1 = serialize(record1);
  const r2 = serialize(record2);

  return NextResponse.json({
    record1: r1, record2: r2,
    delta: {
      base_delta:       r1.base_salary - r2.base_salary,
      bonus_delta:      r1.bonus - r2.bonus,
      stock_delta:      r1.stock - r2.stock,
      tc_delta:         r1.total_compensation - r2.total_compensation,
      experience_delta: r1.experience_years - r2.experience_years,
    },
  });
}