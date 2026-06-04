const { PrismaClient, Level, Currency, Source } = require("@prisma/client") as any;

const prisma = new PrismaClient();

const LEGAL_SUFFIXES =
  /\b(pvt\.?\s*ltd\.?|private\s+limited|inc\.?|llc\.?|ltd\.?|limited|corp\.?|corporation|technologies|technology|services|solutions|india|bpo|web\s+services|\.com)\b/gi;

function normalizeCompanyName(raw: string): string {
  return raw.toLowerCase().trim().replace(LEGAL_SUFFIXES, "").replace(/\s+/g, " ").trim();
}

const COMPANY_ALIASES: Record<string, string> = {
  "tata consultancy": "tcs",
  "tata consultancy services": "tcs",
  tcs: "tcs",
  "tcs ltd": "tcs",
  google: "google",
  "google india": "google",
  "amazon web services": "aws",
  aws: "aws",
  "infosys bpo": "infosys",
  "flipkart internet": "flipkart",
  wipro: "wipro",
};

function resolveSlug(raw: string): string {
  const normalized = normalizeCompanyName(raw);
  return COMPANY_ALIASES[normalized] ?? normalized.replace(/\s+/g, "-");
}

const COMPANIES = [
  { displayName: "Google",    rawVariants: ["Google", "GOOGLE", "Google India Pvt. Ltd."],          industry: "Technology",       headquarters: "Bengaluru",  founded_year: 1998, headcount_range: "100,000+" },
  { displayName: "Amazon",    rawVariants: ["Amazon", "amazon.com"],                                 industry: "E-Commerce / Cloud", headquarters: "Bengaluru",  founded_year: 1994, headcount_range: "100,000+" },
  { displayName: "Meta",      rawVariants: ["Meta"],                                                 industry: "Social Media",     headquarters: "Bengaluru",  founded_year: 2004, headcount_range: "50,000+"  },
  { displayName: "Microsoft", rawVariants: ["Microsoft"],                                            industry: "Technology",       headquarters: "Hyderabad",  founded_year: 1975, headcount_range: "100,000+" },
  { displayName: "Flipkart",  rawVariants: ["Flipkart Internet Pvt Ltd", "Flipkart"],                industry: "E-Commerce",       headquarters: "Bengaluru",  founded_year: 2007, headcount_range: "20,000+"  },
  { displayName: "Meesho",    rawVariants: ["Meesho"],                                               industry: "E-Commerce",       headquarters: "Bengaluru",  founded_year: 2015, headcount_range: "5,000+"   },
  { displayName: "NVIDIA",    rawVariants: ["NVIDIA"],                                               industry: "Semiconductors",   headquarters: "Pune",       founded_year: 1993, headcount_range: "10,000+"  },
  { displayName: "TCS",       rawVariants: ["Tata Consultancy Services", "TCS Ltd.", "Tata Consultancy"], industry: "IT Services",  headquarters: "Mumbai",     founded_year: 1968, headcount_range: "500,000+" },
  { displayName: "Infosys",   rawVariants: ["Infosys", "Infosys BPO"],                              industry: "IT Services",      headquarters: "Bengaluru",  founded_year: 1981, headcount_range: "300,000+" },
  { displayName: "Wipro",     rawVariants: ["Wipro Technologies", "Wipro"],                         industry: "IT Services",      headquarters: "Bengaluru",  founded_year: 1945, headcount_range: "200,000+" },
  { displayName: "Razorpay",  rawVariants: ["Razorpay"],                                            industry: "Fintech",          headquarters: "Bengaluru",  founded_year: 2014, headcount_range: "3,000+"   },
  { displayName: "Zepto",     rawVariants: ["Zepto"],                                               industry: "Quick Commerce",   headquarters: "Mumbai",     founded_year: 2021, headcount_range: "2,000+"   },
];

interface SalaryInput {
  companySlug: string; role: string; level: any; location: string;
  currency: any; experience_years: number; base_salary: number;
  bonus?: number; stock?: number; source?: any;
  confidence_score?: number; is_verified?: boolean;
}

const SALARIES: SalaryInput[] = [
  { companySlug:"google", role:"Software Engineer",     level:Level.L3,        location:"Bengaluru",    currency:Currency.INR, experience_years:1,  base_salary:2400000,  bonus:300000,  stock:800000,  source:Source.CONTRIBUTOR, confidence_score:0.95, is_verified:true  },
  { companySlug:"google", role:"Software Engineer",     level:Level.L4,        location:"Bengaluru",    currency:Currency.INR, experience_years:3,  base_salary:3600000,  bonus:540000,  stock:2000000, source:Source.CONTRIBUTOR, confidence_score:0.95, is_verified:true  },
  { companySlug:"google", role:"Software Engineer",     level:Level.L5,        location:"Bengaluru",    currency:Currency.INR, experience_years:6,  base_salary:5500000,  bonus:1100000, stock:5000000, source:Source.CONTRIBUTOR, confidence_score:0.92, is_verified:true  },
  { companySlug:"google", role:"Software Engineer",     level:Level.L6,        location:"Bengaluru",    currency:Currency.INR, experience_years:10, base_salary:8000000,  bonus:2000000, stock:10000000,source:Source.CONTRIBUTOR, confidence_score:0.90, is_verified:true  },
  { companySlug:"google", role:"Software Engineer",     level:Level.STAFF,     location:"Bengaluru",    currency:Currency.INR, experience_years:14, base_salary:12000000, bonus:3600000, stock:18000000,source:Source.CONTRIBUTOR, confidence_score:0.88, is_verified:true  },
  { companySlug:"google", role:"Product Manager",       level:Level.L5,        location:"Bengaluru",    currency:Currency.INR, experience_years:7,  base_salary:5000000,  bonus:1250000, stock:4500000, source:Source.CONTRIBUTOR, confidence_score:0.90, is_verified:true  },
  { companySlug:"google", role:"Data Scientist",        level:Level.L4,        location:"Hyderabad",    currency:Currency.INR, experience_years:4,  base_salary:3200000,  bonus:480000,  stock:1800000, source:Source.SCRAPED,     confidence_score:0.70 },
  { companySlug:"google", role:"Software Engineer",     level:Level.L4,        location:"Hyderabad",    currency:Currency.INR, experience_years:4,  base_salary:3400000,  bonus:500000,  stock:2100000, source:Source.CONTRIBUTOR, confidence_score:0.93, is_verified:true  },
  { companySlug:"google", role:"Technical Writer",      level:Level.L3,        location:"Bengaluru",    currency:Currency.INR, experience_years:2,  base_salary:1800000,  bonus:0,       stock:0,       source:Source.SCRAPED,     confidence_score:0.60 },
  { companySlug:"google", role:"Distinguished Engineer",level:Level.PRINCIPAL,  location:"San Francisco",currency:Currency.USD, experience_years:20, base_salary:40000000, bonus:12000000,stock:50000000,source:Source.CONTRIBUTOR, confidence_score:0.85, is_verified:true  },

  { companySlug:"amazon", role:"Software Development Engineer", level:Level.SDE_I,   location:"Bengaluru", currency:Currency.INR, experience_years:1,  base_salary:2000000,  bonus:200000,  stock:600000,  source:Source.CONTRIBUTOR, confidence_score:0.94, is_verified:true  },
  { companySlug:"amazon", role:"Software Development Engineer", level:Level.SDE_II,  location:"Bengaluru", currency:Currency.INR, experience_years:4,  base_salary:3200000,  bonus:480000,  stock:2400000, source:Source.CONTRIBUTOR, confidence_score:0.94, is_verified:true  },
  { companySlug:"amazon", role:"Software Development Engineer", level:Level.SDE_III, location:"Bengaluru", currency:Currency.INR, experience_years:8,  base_salary:4800000,  bonus:960000,  stock:5500000, source:Source.CONTRIBUTOR, confidence_score:0.92, is_verified:true  },
  { companySlug:"amazon", role:"Software Development Engineer", level:Level.PRINCIPAL,location:"Bengaluru", currency:Currency.INR, experience_years:15, base_salary:9000000,  bonus:2700000, stock:15000000,source:Source.CONTRIBUTOR, confidence_score:0.88, is_verified:true  },
  { companySlug:"amazon", role:"Product Manager",               level:Level.L5,      location:"Bengaluru", currency:Currency.INR, experience_years:6,  base_salary:4200000,  bonus:840000,  stock:3000000, source:Source.CONTRIBUTOR, confidence_score:0.89, is_verified:true  },
  { companySlug:"amazon", role:"Data Engineer",                 level:Level.SDE_II,  location:"Bengaluru", currency:Currency.INR, experience_years:5,  base_salary:3000000,  bonus:450000,  stock:2000000, source:Source.CONTRIBUTOR, confidence_score:0.91 },
  { companySlug:"amazon", role:"Senior Software Development Engineer", level:Level.SDE_III, location:"Seattle", currency:Currency.USD, experience_years:9, base_salary:18500000, bonus:3200000, stock:40000000, source:Source.CONTRIBUTOR, confidence_score:0.95, is_verified:true },
  
  { companySlug:"meta", role:"Software Engineer", level:Level.L4, location:"Bengaluru",    currency:Currency.INR, experience_years:3,  base_salary:4000000,  bonus:800000,  stock:3000000,  source:Source.CONTRIBUTOR, confidence_score:0.93, is_verified:true },
  { companySlug:"meta", role:"Software Engineer", level:Level.L5, location:"Bengaluru",    currency:Currency.INR, experience_years:7,  base_salary:6500000,  bonus:1625000, stock:7000000,  source:Source.CONTRIBUTOR, confidence_score:0.92, is_verified:true },
  { companySlug:"meta", role:"Software Engineer", level:Level.L6, location:"Bengaluru",    currency:Currency.INR, experience_years:11, base_salary:9500000,  bonus:2850000, stock:14000000, source:Source.CONTRIBUTOR, confidence_score:0.90, is_verified:true },
  { companySlug:"meta", role:"Data Scientist",    level:Level.L5, location:"Bengaluru",    currency:Currency.INR, experience_years:6,  base_salary:5500000,  bonus:1100000, stock:5000000,  source:Source.CONTRIBUTOR, confidence_score:0.89 },
  { companySlug:"meta", role:"Software Engineer", level:Level.L5, location:"San Francisco",currency:Currency.USD, experience_years:8,  base_salary:21000000, bonus:4200000, stock:25000000, source:Source.CONTRIBUTOR, confidence_score:0.94, is_verified:true },
  { companySlug:"meta", role:"Software Engineer", level:Level.L6, location:"London",       currency:Currency.GBP, experience_years:12, base_salary:19000000, bonus:4750000, stock:18000000, source:Source.CONTRIBUTOR, confidence_score:0.88 },
  
  { companySlug:"microsoft", role:"Software Engineer", level:Level.IC4,      location:"Hyderabad", currency:Currency.INR, experience_years:4,  base_salary:3500000, bonus:525000,  stock:1800000, source:Source.CONTRIBUTOR, confidence_score:0.92, is_verified:true },
  { companySlug:"microsoft", role:"Software Engineer", level:Level.IC5,      location:"Hyderabad", currency:Currency.INR, experience_years:7,  base_salary:5200000, bonus:1040000, stock:4000000, source:Source.CONTRIBUTOR, confidence_score:0.91, is_verified:true },
  { companySlug:"microsoft", role:"Product Manager",   level:Level.IC4,      location:"Hyderabad", currency:Currency.INR, experience_years:5,  base_salary:3800000, bonus:760000,  stock:2200000, source:Source.CONTRIBUTOR, confidence_score:0.90, is_verified:true },
  { companySlug:"microsoft", role:"Software Engineer", level:Level.PRINCIPAL,location:"Hyderabad", currency:Currency.INR, experience_years:13, base_salary:7500000, bonus:2250000, stock:9000000, source:Source.CONTRIBUTOR, confidence_score:0.88, is_verified:true },
  { companySlug:"microsoft", role:"Software Engineer", level:Level.IC4,      location:"Delhi",     currency:Currency.INR, experience_years:5,  base_salary:3200000, bonus:480000,  stock:1500000, source:Source.SCRAPED,     confidence_score:0.66 },
  
  { companySlug:"flipkart", role:"Software Development Engineer", level:Level.SDE_I,   location:"Bengaluru", currency:Currency.INR, experience_years:1, base_salary:1600000, bonus:160000, stock:400000,  source:Source.CONTRIBUTOR, confidence_score:0.90, is_verified:true },
  { companySlug:"flipkart", role:"Software Development Engineer", level:Level.SDE_II,  location:"Bengaluru", currency:Currency.INR, experience_years:4, base_salary:2800000, bonus:420000, stock:1500000, source:Source.CONTRIBUTOR, confidence_score:0.91, is_verified:true },
  { companySlug:"flipkart", role:"Software Development Engineer", level:Level.SDE_III, location:"Bengaluru", currency:Currency.INR, experience_years:8, base_salary:4200000, bonus:840000, stock:4000000, source:Source.CONTRIBUTOR, confidence_score:0.89, is_verified:true },
  { companySlug:"flipkart", role:"Data Scientist",                level:Level.SDE_II,  location:"Bengaluru", currency:Currency.INR, experience_years:5, base_salary:2600000, bonus:390000, stock:1200000, source:Source.SCRAPED,     confidence_score:0.68 },
 
  { companySlug:"meesho", role:"Software Development Engineer", level:Level.SDE_I,  location:"Bengaluru", currency:Currency.INR, experience_years:1, base_salary:1400000, bonus:140000, stock:300000,  source:Source.CONTRIBUTOR, confidence_score:0.88 },
  { companySlug:"meesho", role:"Software Development Engineer", level:Level.SDE_II, location:"Bengaluru", currency:Currency.INR, experience_years:3, base_salary:2400000, bonus:360000, stock:1000000, source:Source.CONTRIBUTOR, confidence_score:0.87, is_verified:true },
  { companySlug:"meesho", role:"Product Manager",               level:Level.L4,     location:"Bengaluru", currency:Currency.INR, experience_years:4, base_salary:2800000, bonus:560000, stock:1200000, source:Source.CONTRIBUTOR, confidence_score:0.86 },
  { companySlug:"meesho", role:"Data Analyst",                  level:Level.L3,     location:"Bengaluru", currency:Currency.INR, experience_years:2, base_salary:1200000, bonus:120000, stock:200000,  source:Source.SCRAPED,     confidence_score:0.60 },
  
  { companySlug:"nvidia", role:"Software Engineer",          level:Level.L5, location:"Pune", currency:Currency.INR, experience_years:7, base_salary:6000000, bonus:1500000, stock:8000000, source:Source.CONTRIBUTOR, confidence_score:0.91, is_verified:true },
  { companySlug:"nvidia", role:"Systems Software Engineer",  level:Level.L4, location:"Pune", currency:Currency.INR, experience_years:4, base_salary:4000000, bonus:800000,  stock:3500000, source:Source.CONTRIBUTOR, confidence_score:0.90, is_verified:true },
  { companySlug:"nvidia", role:"Machine Learning Engineer",  level:Level.L5, location:"Pune", currency:Currency.INR, experience_years:6, base_salary:5500000, bonus:1375000, stock:7000000, source:Source.CONTRIBUTOR, confidence_score:0.92, is_verified:true },
  { companySlug:"nvidia", role:"Technical Program Manager",  level:Level.L4, location:"Pune", currency:Currency.INR, experience_years:5, base_salary:3500000, bonus:525000,  stock:0,       source:Source.CONTRIBUTOR, confidence_score:0.85 },
  
  { companySlug:"tcs", role:"Software Engineer",  level:Level.SDE_I,   location:"Mumbai",  currency:Currency.INR, experience_years:1,  base_salary:650000,  bonus:50000,  stock:0, source:Source.CONTRIBUTOR, confidence_score:0.90, is_verified:true },
  { companySlug:"tcs", role:"Software Engineer",  level:Level.SDE_II,  location:"Mumbai",  currency:Currency.INR, experience_years:4,  base_salary:950000,  bonus:80000,  stock:0, source:Source.CONTRIBUTOR, confidence_score:0.90, is_verified:true },
  { companySlug:"tcs", role:"Software Engineer",  level:Level.SDE_III, location:"Chennai", currency:Currency.INR, experience_years:8,  base_salary:1500000, bonus:150000, stock:0, source:Source.SCRAPED,     confidence_score:0.65 },
  { companySlug:"tcs", role:"Data Analyst",       level:Level.SDE_I,   location:"Pune",    currency:Currency.INR, experience_years:2,  base_salary:600000,  bonus:40000,  stock:0, source:Source.CONTRIBUTOR, confidence_score:0.88 },
  { companySlug:"tcs", role:"Project Manager",    level:Level.L5,      location:"Delhi",   currency:Currency.INR, experience_years:10, base_salary:2000000, bonus:300000, stock:0, source:Source.CONTRIBUTOR, confidence_score:0.87, is_verified:true },
 
  { companySlug:"infosys", role:"Software Engineer",  level:Level.SDE_I,  location:"Bengaluru", currency:Currency.INR, experience_years:1, base_salary:600000,  bonus:40000,  stock:0,      source:Source.CONTRIBUTOR, confidence_score:0.89 },
  { companySlug:"infosys", role:"Software Engineer",  level:Level.SDE_II, location:"Bengaluru", currency:Currency.INR, experience_years:5, base_salary:1100000, bonus:100000, stock:0,      source:Source.SCRAPED,     confidence_score:0.62 },
  { companySlug:"infosys", role:"Technology Lead",    level:Level.L5,     location:"Hyderabad", currency:Currency.INR, experience_years:9, base_salary:2200000, bonus:330000, stock:200000, source:Source.CONTRIBUTOR, confidence_score:0.88, is_verified:true },
  
  { companySlug:"wipro", role:"Software Engineer",        level:Level.SDE_I,  location:"Bengaluru", currency:Currency.INR, experience_years:1,  base_salary:580000,  bonus:40000,  stock:0,      source:Source.CONTRIBUTOR, confidence_score:0.87 },
  { companySlug:"wipro", role:"Senior Software Engineer", level:Level.SDE_II, location:"Pune",      currency:Currency.INR, experience_years:5,  base_salary:1050000, bonus:90000,  stock:0,      source:Source.SCRAPED,     confidence_score:0.60 },
  { companySlug:"wipro", role:"Project Manager",          level:Level.L5,     location:"Mumbai",    currency:Currency.INR, experience_years:10, base_salary:1900000, bonus:285000, stock:100000, source:Source.CONTRIBUTOR, confidence_score:0.85 },
  
  { companySlug:"razorpay", role:"Software Development Engineer", level:Level.SDE_I,   location:"Bengaluru", currency:Currency.INR, experience_years:1, base_salary:1800000, bonus:180000, stock:500000,  source:Source.CONTRIBUTOR, confidence_score:0.91, is_verified:true },
  { companySlug:"razorpay", role:"Software Development Engineer", level:Level.SDE_II,  location:"Bengaluru", currency:Currency.INR, experience_years:4, base_salary:3000000, bonus:450000, stock:1800000, source:Source.CONTRIBUTOR, confidence_score:0.92, is_verified:true },
  { companySlug:"razorpay", role:"Backend Engineer",               level:Level.SDE_III, location:"Bengaluru", currency:Currency.INR, experience_years:7, base_salary:4500000, bonus:900000, stock:4000000, source:Source.CONTRIBUTOR, confidence_score:0.90, is_verified:true },
  { companySlug:"razorpay", role:"Product Manager",                level:Level.L4,      location:"Bengaluru", currency:Currency.INR, experience_years:5, base_salary:3200000, bonus:640000, stock:2000000, source:Source.CONTRIBUTOR, confidence_score:0.89 },
  
  { companySlug:"zepto", role:"Software Engineer", level:Level.SDE_I,  location:"Mumbai", currency:Currency.INR, experience_years:1, base_salary:1600000, bonus:160000, stock:400000,  source:Source.CONTRIBUTOR, confidence_score:0.87 },
  { companySlug:"zepto", role:"Software Engineer", level:Level.SDE_II, location:"Mumbai", currency:Currency.INR, experience_years:3, base_salary:2600000, bonus:390000, stock:1200000, source:Source.CONTRIBUTOR, confidence_score:0.88, is_verified:true },
  { companySlug:"zepto", role:"Data Scientist",    level:Level.L4,     location:"Mumbai", currency:Currency.INR, experience_years:4, base_salary:2800000, bonus:420000, stock:1000000, source:Source.CONTRIBUTOR, confidence_score:0.86 },
];

async function main() {
  console.log("🌱 Starting seed...");
  const companyMap: Record<string, string> = {};

  for (const c of COMPANIES) {
    const slug = resolveSlug(c.rawVariants[0]);
    const company = await prisma.company.upsert({
      where: { slug },
      update: { updated_at: new Date() },
      create: {
        name: c.displayName, slug,
        normalized_name: normalizeCompanyName(c.rawVariants[0]),
        industry: c.industry, headquarters: c.headquarters,
        founded_year: c.founded_year ?? null,
        headcount_range: c.headcount_range ?? null,
      },
    });
    companyMap[slug] = company.id;
    if (c.rawVariants.length > 1)
      console.log(`  [${c.rawVariants.join(", ")}] → "${slug}"`);
  }

  await prisma.salary.deleteMany({});
  let inserted = 0;

  for (const s of SALARIES) {
    const companyId = companyMap[s.companySlug];
    if (!companyId) { console.warn(`⚠ Missing slug: ${s.companySlug}`); continue; }
    const base = BigInt(s.base_salary);
    const bonus = BigInt(s.bonus ?? 0);
    const stock = BigInt(s.stock ?? 0);
    await prisma.salary.create({
      data: {
        company_id: companyId, role: s.role, level: s.level,
        location: s.location, currency: s.currency,
        experience_years: s.experience_years,
        base_salary: base, bonus, stock,
        total_compensation: base + bonus + stock,
        source: s.source ?? Source.CONTRIBUTOR,
        confidence_score: s.confidence_score ?? 0.8,
        is_verified: s.is_verified ?? false,
      },
    });
    inserted++;
  }
  console.log(`✅ Done: ${Object.keys(companyMap).length} companies, ${inserted} salaries`);
}

main().catch(console.error).finally(() => prisma.$disconnect());