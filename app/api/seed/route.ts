import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/db";

export const maxDuration = 60; 

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {

    console.log("[seed] Waking up Neon DB...");
    await withRetry(() => prisma.$queryRaw`SELECT 1`, 6, 2000);
    console.log("[seed] DB is awake.");

    await withRetry(() => prisma.salary.deleteMany({}));
    await withRetry(() => prisma.company.deleteMany({}));

    const companiesData = [
      { name: "Google",    slug: "google",    normalized_name: "google",    industry: "Technology",        headquarters: "Bengaluru",  founded_year: 1998, headcount_range: "100,000+" },
      { name: "Amazon",   slug: "amazon",    normalized_name: "amazon",    industry: "E-Commerce / Cloud", headquarters: "Bengaluru",  founded_year: 1994, headcount_range: "100,000+" },
      { name: "Meta",     slug: "meta",      normalized_name: "meta",      industry: "Social Media",       headquarters: "Bengaluru",  founded_year: 2004, headcount_range: "50,000+"  },
      { name: "Microsoft",slug: "microsoft", normalized_name: "microsoft", industry: "Technology",        headquarters: "Hyderabad",  founded_year: 1975, headcount_range: "100,000+" },
      { name: "Flipkart", slug: "flipkart",  normalized_name: "flipkart",  industry: "E-Commerce",        headquarters: "Bengaluru",  founded_year: 2007, headcount_range: "20,000+"  },
      { name: "Meesho",   slug: "meesho",    normalized_name: "meesho",    industry: "E-Commerce",        headquarters: "Bengaluru",  founded_year: 2015, headcount_range: "5,000+"   },
      { name: "NVIDIA",   slug: "nvidia",    normalized_name: "nvidia",    industry: "Semiconductors",    headquarters: "Pune",       founded_year: 1993, headcount_range: "10,000+"  },
      { name: "TCS",      slug: "tcs",       normalized_name: "tcs",       industry: "IT Services",       headquarters: "Mumbai",     founded_year: 1968, headcount_range: "500,000+" },
      { name: "Infosys",  slug: "infosys",   normalized_name: "infosys",   industry: "IT Services",       headquarters: "Bengaluru",  founded_year: 1981, headcount_range: "300,000+" },
      { name: "Wipro",    slug: "wipro",     normalized_name: "wipro",     industry: "IT Services",       headquarters: "Bengaluru",  founded_year: 1945, headcount_range: "200,000+" },
      { name: "Razorpay", slug: "razorpay",  normalized_name: "razorpay",  industry: "Fintech",           headquarters: "Bengaluru",  founded_year: 2014, headcount_range: "3,000+"   },
      { name: "Zepto",    slug: "zepto",     normalized_name: "zepto",     industry: "Quick Commerce",    headquarters: "Mumbai",     founded_year: 2021, headcount_range: "2,000+"   },
    ];

    const companies = await withRetry(() =>
      prisma.company.createMany({ data: companiesData })
    );

    const allCompanies = await withRetry(() =>
      prisma.company.findMany({ select: { id: true, slug: true } })
    );
    const cm: Record<string, string> = {};
    for (const c of allCompanies as { id: string; slug: string }[]) {
      cm[c.slug] = c.id;
    }

    type Row = { slug:string; role:string; level:string; location:string; currency:string; exp:number; base:number; bonus?:number; stock?:number; verified?:boolean; cs?:number; source?:string };

    const rows: Row[] = [
      { slug:"google", role:"Software Engineer",      level:"L3",        location:"Bengaluru",    currency:"INR", exp:1,  base:2400000,  bonus:300000,  stock:800000,  verified:true,  cs:0.95 },
      { slug:"google", role:"Software Engineer",      level:"L4",        location:"Bengaluru",    currency:"INR", exp:3,  base:3600000,  bonus:540000,  stock:2000000, verified:true,  cs:0.95 },
      { slug:"google", role:"Software Engineer",      level:"L5",        location:"Bengaluru",    currency:"INR", exp:6,  base:5500000,  bonus:1100000, stock:5000000, verified:true,  cs:0.92 },
      { slug:"google", role:"Software Engineer",      level:"L6",        location:"Bengaluru",    currency:"INR", exp:10, base:8000000,  bonus:2000000, stock:10000000,verified:true,  cs:0.90 },
      { slug:"google", role:"Software Engineer",      level:"STAFF",     location:"Bengaluru",    currency:"INR", exp:14, base:12000000, bonus:3600000, stock:18000000,verified:true,  cs:0.88 },
      { slug:"google", role:"Product Manager",        level:"L5",        location:"Bengaluru",    currency:"INR", exp:7,  base:5000000,  bonus:1250000, stock:4500000, verified:true,  cs:0.90 },
      { slug:"google", role:"Data Scientist",         level:"L4",        location:"Hyderabad",    currency:"INR", exp:4,  base:3200000,  bonus:480000,  stock:1800000, cs:0.70, source:"SCRAPED" },
      { slug:"google", role:"Software Engineer",      level:"L4",        location:"Hyderabad",    currency:"INR", exp:4,  base:3400000,  bonus:500000,  stock:2100000, verified:true,  cs:0.93 },
      { slug:"google", role:"Technical Writer",       level:"L3",        location:"Bengaluru",    currency:"INR", exp:2,  base:1800000,  bonus:0,       stock:0,       cs:0.60, source:"SCRAPED" },
      { slug:"google", role:"Distinguished Engineer", level:"PRINCIPAL", location:"San Francisco",currency:"USD", exp:20, base:40000000, bonus:12000000,stock:50000000,verified:true,  cs:0.85 },
      { slug:"amazon", role:"Software Development Engineer", level:"SDE_I",    location:"Bengaluru", currency:"INR", exp:1,  base:2000000,  bonus:200000,  stock:600000,  verified:true, cs:0.94 },
      { slug:"amazon", role:"Software Development Engineer", level:"SDE_II",   location:"Bengaluru", currency:"INR", exp:4,  base:3200000,  bonus:480000,  stock:2400000, verified:true, cs:0.94 },
      { slug:"amazon", role:"Software Development Engineer", level:"SDE_III",  location:"Bengaluru", currency:"INR", exp:8,  base:4800000,  bonus:960000,  stock:5500000, verified:true, cs:0.92 },
      { slug:"amazon", role:"Software Development Engineer", level:"PRINCIPAL",location:"Bengaluru", currency:"INR", exp:15, base:9000000,  bonus:2700000, stock:15000000,verified:true, cs:0.88 },
      { slug:"amazon", role:"Product Manager",               level:"L5",       location:"Bengaluru", currency:"INR", exp:6,  base:4200000,  bonus:840000,  stock:3000000, verified:true, cs:0.89 },
      { slug:"amazon", role:"Data Engineer",                 level:"SDE_II",   location:"Bengaluru", currency:"INR", exp:5,  base:3000000,  bonus:450000,  stock:2000000, cs:0.91 },
      { slug:"amazon", role:"Sr. SDE",                       level:"SDE_III",  location:"Seattle",   currency:"USD", exp:9,  base:18500000, bonus:3200000, stock:40000000,verified:true, cs:0.95 },
      { slug:"meta", role:"Software Engineer", level:"L4", location:"Bengaluru",    currency:"INR", exp:3,  base:4000000,  bonus:800000,  stock:3000000,  verified:true, cs:0.93 },
      { slug:"meta", role:"Software Engineer", level:"L5", location:"Bengaluru",    currency:"INR", exp:7,  base:6500000,  bonus:1625000, stock:7000000,  verified:true, cs:0.92 },
      { slug:"meta", role:"Software Engineer", level:"L6", location:"Bengaluru",    currency:"INR", exp:11, base:9500000,  bonus:2850000, stock:14000000, verified:true, cs:0.90 },
      { slug:"meta", role:"Data Scientist",    level:"L5", location:"Bengaluru",    currency:"INR", exp:6,  base:5500000,  bonus:1100000, stock:5000000,  cs:0.89 },
      { slug:"meta", role:"Software Engineer", level:"L5", location:"San Francisco",currency:"USD", exp:8,  base:21000000, bonus:4200000, stock:25000000, verified:true, cs:0.94 },
      { slug:"meta", role:"Software Engineer", level:"L6", location:"London",       currency:"GBP", exp:12, base:19000000, bonus:4750000, stock:18000000, cs:0.88 },
      { slug:"microsoft", role:"Software Engineer", level:"IC4",      location:"Hyderabad", currency:"INR", exp:4,  base:3500000, bonus:525000,  stock:1800000, verified:true, cs:0.92 },
      { slug:"microsoft", role:"Software Engineer", level:"IC5",      location:"Hyderabad", currency:"INR", exp:7,  base:5200000, bonus:1040000, stock:4000000, verified:true, cs:0.91 },
      { slug:"microsoft", role:"Product Manager",   level:"IC4",      location:"Hyderabad", currency:"INR", exp:5,  base:3800000, bonus:760000,  stock:2200000, verified:true, cs:0.90 },
      { slug:"microsoft", role:"Software Engineer", level:"PRINCIPAL",location:"Hyderabad", currency:"INR", exp:13, base:7500000, bonus:2250000, stock:9000000, verified:true, cs:0.88 },
      { slug:"microsoft", role:"Software Engineer", level:"IC4",      location:"Delhi",     currency:"INR", exp:5,  base:3200000, bonus:480000,  stock:1500000, cs:0.66, source:"SCRAPED" },
      { slug:"flipkart", role:"Software Development Engineer", level:"SDE_I",   location:"Bengaluru", currency:"INR", exp:1, base:1600000, bonus:160000, stock:400000,  verified:true, cs:0.90 },
      { slug:"flipkart", role:"Software Development Engineer", level:"SDE_II",  location:"Bengaluru", currency:"INR", exp:4, base:2800000, bonus:420000, stock:1500000, verified:true, cs:0.91 },
      { slug:"flipkart", role:"Software Development Engineer", level:"SDE_III", location:"Bengaluru", currency:"INR", exp:8, base:4200000, bonus:840000, stock:4000000, verified:true, cs:0.89 },
      { slug:"flipkart", role:"Data Scientist",                level:"SDE_II",  location:"Bengaluru", currency:"INR", exp:5, base:2600000, bonus:390000, stock:1200000, cs:0.68, source:"SCRAPED" },
      { slug:"meesho", role:"Software Development Engineer", level:"SDE_I",  location:"Bengaluru", currency:"INR", exp:1, base:1400000, bonus:140000, stock:300000,  cs:0.88 },
      { slug:"meesho", role:"Software Development Engineer", level:"SDE_II", location:"Bengaluru", currency:"INR", exp:3, base:2400000, bonus:360000, stock:1000000, verified:true, cs:0.87 },
      { slug:"meesho", role:"Product Manager",               level:"L4",     location:"Bengaluru", currency:"INR", exp:4, base:2800000, bonus:560000, stock:1200000, cs:0.86 },
      { slug:"meesho", role:"Data Analyst",                  level:"L3",     location:"Bengaluru", currency:"INR", exp:2, base:1200000, bonus:120000, stock:200000,  cs:0.60, source:"SCRAPED" },
      { slug:"nvidia", role:"Software Engineer",         level:"L5", location:"Pune", currency:"INR", exp:7, base:6000000, bonus:1500000, stock:8000000, verified:true, cs:0.91 },
      { slug:"nvidia", role:"Systems Software Engineer", level:"L4", location:"Pune", currency:"INR", exp:4, base:4000000, bonus:800000,  stock:3500000, verified:true, cs:0.90 },
      { slug:"nvidia", role:"Machine Learning Engineer", level:"L5", location:"Pune", currency:"INR", exp:6, base:5500000, bonus:1375000, stock:7000000, verified:true, cs:0.92 },
      { slug:"nvidia", role:"Technical Program Manager", level:"L4", location:"Pune", currency:"INR", exp:5, base:3500000, bonus:525000,  stock:0,       cs:0.85 },
      { slug:"tcs", role:"Software Engineer", level:"SDE_I",   location:"Mumbai",  currency:"INR", exp:1,  base:650000,  bonus:50000,  stock:0, verified:true, cs:0.90 },
      { slug:"tcs", role:"Software Engineer", level:"SDE_II",  location:"Mumbai",  currency:"INR", exp:4,  base:950000,  bonus:80000,  stock:0, verified:true, cs:0.90 },
      { slug:"tcs", role:"Software Engineer", level:"SDE_III", location:"Chennai", currency:"INR", exp:8,  base:1500000, bonus:150000, stock:0, cs:0.65, source:"SCRAPED" },
      { slug:"tcs", role:"Data Analyst",      level:"SDE_I",   location:"Pune",    currency:"INR", exp:2,  base:600000,  bonus:40000,  stock:0, cs:0.88 },
      { slug:"tcs", role:"Project Manager",   level:"L5",      location:"Delhi",   currency:"INR", exp:10, base:2000000, bonus:300000, stock:0, verified:true, cs:0.87 },
      { slug:"infosys", role:"Software Engineer", level:"SDE_I",  location:"Bengaluru", currency:"INR", exp:1, base:600000,  bonus:40000,  stock:0,      cs:0.89 },
      { slug:"infosys", role:"Software Engineer", level:"SDE_II", location:"Bengaluru", currency:"INR", exp:5, base:1100000, bonus:100000, stock:0,      cs:0.62, source:"SCRAPED" },
      { slug:"infosys", role:"Technology Lead",   level:"L5",     location:"Hyderabad", currency:"INR", exp:9, base:2200000, bonus:330000, stock:200000, verified:true, cs:0.88 },
      { slug:"wipro", role:"Software Engineer",        level:"SDE_I",  location:"Bengaluru", currency:"INR", exp:1,  base:580000,  bonus:40000,  stock:0,      cs:0.87 },
      { slug:"wipro", role:"Senior Software Engineer", level:"SDE_II", location:"Pune",      currency:"INR", exp:5,  base:1050000, bonus:90000,  stock:0,      cs:0.60, source:"SCRAPED" },
      { slug:"wipro", role:"Project Manager",          level:"L5",     location:"Mumbai",    currency:"INR", exp:10, base:1900000, bonus:285000, stock:100000, cs:0.85 },
      { slug:"razorpay", role:"Software Development Engineer", level:"SDE_I",   location:"Bengaluru", currency:"INR", exp:1, base:1800000, bonus:180000, stock:500000,  verified:true, cs:0.91 },
      { slug:"razorpay", role:"Software Development Engineer", level:"SDE_II",  location:"Bengaluru", currency:"INR", exp:4, base:3000000, bonus:450000, stock:1800000, verified:true, cs:0.92 },
      { slug:"razorpay", role:"Backend Engineer",               level:"SDE_III", location:"Bengaluru", currency:"INR", exp:7, base:4500000, bonus:900000, stock:4000000, verified:true, cs:0.90 },
      { slug:"razorpay", role:"Product Manager",                level:"L4",      location:"Bengaluru", currency:"INR", exp:5, base:3200000, bonus:640000, stock:2000000, cs:0.89 },
      { slug:"zepto", role:"Software Engineer", level:"SDE_I",  location:"Mumbai", currency:"INR", exp:1, base:1600000, bonus:160000, stock:400000,  cs:0.87 },
      { slug:"zepto", role:"Software Engineer", level:"SDE_II", location:"Mumbai", currency:"INR", exp:3, base:2600000, bonus:390000, stock:1200000, verified:true, cs:0.88 },
      { slug:"zepto", role:"Data Scientist",    level:"L4",     location:"Mumbai", currency:"INR", exp:4, base:2800000, bonus:420000, stock:1000000, cs:0.86 },
    ];

    let inserted = 0;
    const errors: string[] = [];

    const BATCH = 10;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (s) => {
          const cid = cm[s.slug];
          if (!cid) return;
          const base  = BigInt(s.base);
          const bonus = BigInt(s.bonus ?? 0);
          const stock = BigInt(s.stock ?? 0);
          try {
            await withRetry(() => prisma.salary.create({
              data: {
                company_id: cid,
                role: s.role,
                level: s.level as never,
                location: s.location,
                currency: s.currency as never,
                experience_years: s.exp,
                base_salary: base,
                bonus,
                stock,
                total_compensation: base + bonus + stock,
                source: (s.source ?? "CONTRIBUTOR") as never,
                confidence_score: s.cs ?? 0.85,
                is_verified: s.verified ?? false,
              },
            }));
            inserted++;
          } catch (e) {
            errors.push(`${s.slug}/${s.role}: ${String(e).slice(0, 80)}`);
          }
        })
      );
      
      if (i + BATCH < rows.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    return NextResponse.json({
      success: true,
      companies: Object.keys(cm).length,
      salaries: inserted,
      errors: errors.length > 0 ? errors : undefined,
      message: `✅ Seeded ${Object.keys(cm).length} companies and ${inserted} salaries. Now visit /companies/google`,
    });
  } catch (err) {
    console.error("[seed] Fatal error:", err);
    return NextResponse.json({
      error: String(err),
      tip: "Neon DB might still be waking up. Wait 10 seconds and try again.",
    }, { status: 500 });
  }
}