import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeCompanyName, toSlug, displayName } from "@/lib/normalize";
import { revalidatePath } from "next/cache";

const VALID_LEVELS    = ["L3","L4","L5","L6","SDE_I","SDE_II","SDE_III","STAFF","PRINCIPAL","IC4","IC5"] as const;
const VALID_CURRENCIES = ["INR","USD","GBP","EUR"] as const;
const VALID_SOURCES   = ["CONTRIBUTOR","SCRAPED","AI_INFERRED"] as const;

function validate(body: Record<string, unknown>) {
  const errors: { field: string; message: string }[] = [];
  if (!body.company || typeof body.company !== "string" || body.company.trim().length < 2)
    errors.push({ field: "company", message: "company is required and must be at least 2 characters" });
  if (!body.role || typeof body.role !== "string")
    errors.push({ field: "role", message: "role is required" });
  if (!body.level || !VALID_LEVELS.includes(body.level as never))
    errors.push({ field: "level", message: `level must be one of: ${VALID_LEVELS.join(", ")}` });
  if (!body.location || typeof body.location !== "string")
    errors.push({ field: "location", message: "location is required" });
  if (!body.currency || !VALID_CURRENCIES.includes(body.currency as never))
    errors.push({ field: "currency", message: `currency must be one of: ${VALID_CURRENCIES.join(", ")}` });
  if (!body.source || !VALID_SOURCES.includes(body.source as never))
    errors.push({ field: "source", message: `source must be one of: ${VALID_SOURCES.join(", ")}` });
  const exp = Number(body.experience_years);
  if (!Number.isInteger(exp) || exp <= 0 || exp >= 51)
    errors.push({ field: "experience_years", message: "experience_years must be an integer between 1 and 50" });
  const base = Number(body.base_salary);
  if (!base || base <= 0)
    errors.push({ field: "base_salary", message: "base_salary must be greater than 0" });
  const cs = Number(body.confidence_score);
  if (isNaN(cs) || cs < 0.0 || cs > 1.0)
    errors.push({ field: "confidence_score", message: "confidence_score must be between 0.0 and 1.0" });
  return errors;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: true, message: "Invalid JSON body" }, { status: 400 }); }

  const errors = validate(body);
  if (errors.length > 0) return NextResponse.json({ error: true, errors }, { status: 400 });

  const slug       = toSlug(body.company as string);
  const normalized = normalizeCompanyName(body.company as string);

  const company = await prisma.company.upsert({
    where: { slug },
    update: { updated_at: new Date() },
    create: { name: displayName(slug), slug, normalized_name: normalized },
  });

  // NEVER trust client total_compensation — always recompute
  const base  = BigInt(Math.round(Number(body.base_salary)));
  const bonus = BigInt(Math.round(Number(body.bonus ?? 0)));
  const stock = BigInt(Math.round(Number(body.stock ?? 0)));
  const total_compensation = base + bonus + stock;

  // Dedup: same company+role+level+location in last 48h, base within 10%
  const cutoff   = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const existing = await prisma.salary.findFirst({
    where: { company_id: company.id, role: body.role as string, level: body.level as never, location: body.location as string, submitted_at: { gte: cutoff } },
  });
  if (existing) {
    const diff = Math.abs(Number(existing.base_salary) - Number(base)) / Number(existing.base_salary);
    if (diff <= 0.10) return NextResponse.json({ error: true, message: `Duplicate: similar record submitted within 48h`, existing_id: existing.id }, { status: 409 });
  }

  const salary = await prisma.salary.create({
    data: {
      company_id: company.id, role: body.role as string, level: body.level as never,
      location: body.location as string, currency: body.currency as never,
      experience_years: Number(body.experience_years),
      base_salary: base, bonus, stock, total_compensation,
      source: body.source as never, confidence_score: Number(body.confidence_score),
      is_verified: false,
    },
    include: { company: true },
  });

  revalidatePath("/salaries");
  revalidatePath(`/companies/${slug}`);

  return NextResponse.json({
    ...salary,
    base_salary: Number(salary.base_salary), bonus: Number(salary.bonus),
    stock: Number(salary.stock), total_compensation: Number(salary.total_compensation),
    company_slug: slug, company_name: company.name,
  }, { status: 201 });
}