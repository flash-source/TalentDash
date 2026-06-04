export const COMPANY_ALIASES: Record<string, string> = {
  "tata consultancy": "tcs",
  "tata consultancy services": "tcs",
  tcs: "tcs",
  "google india": "google",
  google: "google",
  "amazon web services": "aws",
  aws: "aws",
  "infosys bpo": "infosys",
  "flipkart internet": "flipkart",
  "wipro technologies": "wipro",
  wipro: "wipro",
  meta: "meta",
  facebook: "meta",
  microsoft: "microsoft",
  amazon: "amazon",
  meesho: "meesho",
  razorpay: "razorpay",
  zepto: "zepto",
  nvidia: "nvidia",
};

const LEGAL_SUFFIX_RE =
  /\b(pvt\.?\s*ltd\.?|private\s+limited|inc\.?|llc\.?|ltd\.?|limited|corp\.?|corporation|technologies|technology|services|solutions|india|bpo|web\s+services|internet|\.com)\b/gi;

export function normalizeCompanyName(raw: string): string {
  const cleaned = raw
    .toLowerCase().trim()
    .replace(LEGAL_SUFFIX_RE, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ").trim();
  return COMPANY_ALIASES[cleaned] ?? cleaned;
}

export function toSlug(raw: string): string {
  return normalizeCompanyName(raw).replace(/\s+/g, "-");
}

const DISPLAY_NAMES: Record<string, string> = {
  google: "Google", amazon: "Amazon", aws: "Amazon Web Services",
  meta: "Meta", microsoft: "Microsoft", flipkart: "Flipkart",
  meesho: "Meesho", nvidia: "NVIDIA", tcs: "TCS",
  infosys: "Infosys", wipro: "Wipro", razorpay: "Razorpay", zepto: "Zepto",
};

export function displayName(slug: string): string {
  return DISPLAY_NAMES[slug] ??
    slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}