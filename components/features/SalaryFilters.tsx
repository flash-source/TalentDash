"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState, useTransition } from "react";

const LOCATIONS = ["Bengaluru","Mumbai","Hyderabad","Pune","Delhi","Chennai","San Francisco","Seattle","London","Remote"];
const ROLES = ["Software Engineer","Software Development Engineer","Product Manager","Data Scientist","Data Analyst","Data Engineer","Machine Learning Engineer","Backend Engineer","Project Manager","Technology Lead","Technical Writer","Distinguished Engineer"];
const ALL_LEVELS = ["L3","L4","L5","L6","SDE_I","SDE_II","SDE_III","STAFF","PRINCIPAL","IC4","IC5"];
const LEVEL_LABELS: Record<string, string> = {
  L3:"L3",L4:"L4",L5:"L5",L6:"L6",SDE_I:"SDE-I",SDE_II:"SDE-II",SDE_III:"SDE-III",STAFF:"Staff",PRINCIPAL:"Principal",IC4:"IC4",IC5:"IC5"
};

export function SalaryFilters({ initialCurrency }: { initialCurrency: "INR" | "USD" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [levelOpen, setLevelOpen] = useState(false);

  const get = (key: string) => searchParams.get(key) ?? "";
  const activeLevels = get("level") ? get("level").split(",") : [];
  const hasFilters = !!(get("company") || get("role") || get("level") || get("location"));

  function push(updates: Record<string, string | string[] | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (!v || (Array.isArray(v) && v.length === 0)) params.delete(k);
      else if (Array.isArray(v)) params.set(k, v.join(","));
      else params.set(k, v);
    }
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleCompany(e: React.ChangeEvent<HTMLInputElement>) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push({ company: e.target.value }), 300);
  }

  function toggleLevel(l: string) {
    const next = activeLevels.includes(l) ? activeLevels.filter((x) => x !== l) : [...activeLevels, l];
    push({ level: next });
  }

  const inputStyle = { border: "1px solid #EBEBEB", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#222222", backgroundColor: "#fff", outline: "none", width: "100%" };
  const labelStyle = { fontSize: 11, fontWeight: 600 as const, color: "#717171", textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block", marginBottom: 6 };

  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
        <div style={{ minWidth: 180 }}>
          <label style={labelStyle}>Company</label>
          <input type="text" defaultValue={get("company")} onChange={handleCompany} placeholder="Search companies..." style={inputStyle} />
        </div>

        <div style={{ minWidth: 180 }}>
          <label style={labelStyle}>Role</label>
          <select value={get("role")} onChange={(e) => push({ role: e.target.value })} style={inputStyle}>
            <option value="">All Roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div style={{ minWidth: 150, position: "relative" }}>
          <label style={labelStyle}>Level</label>
          <button onClick={() => setLevelOpen((o) => !o)}
            style={{ ...inputStyle, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <span>{activeLevels.length > 0 ? activeLevels.map(l => LEVEL_LABELS[l] ?? l).join(", ") : "All Levels"}</span>
            <span style={{ color: "#717171", fontSize: 11 }}>▾</span>
          </button>
          {levelOpen && (
            <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", zIndex: 50, padding: 8, minWidth: 160 }}>
              {ALL_LEVELS.map((l) => (
                <label key={l} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#222222" }}>
                  <input type="checkbox" checked={activeLevels.includes(l)} onChange={() => toggleLevel(l)} style={{ accentColor: "#FF5A5F" }} />
                  {LEVEL_LABELS[l]}
                </label>
              ))}
            </div>
          )}
        </div>

        <div style={{ minWidth: 150 }}>
          <label style={labelStyle}>Location</label>
          <select value={get("location")} onChange={(e) => push({ location: e.target.value })} style={inputStyle}>
            <option value="">All Locations</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Currency</label>
          <div style={{ display: "flex", border: "1px solid #EBEBEB", borderRadius: 8, overflow: "hidden" }}>
            {(["INR", "USD"] as const).map((c) => {
              const active = (get("currency") || "INR") === c;
              return (
                <button key={c} onClick={() => push({ currency: c })}
                  style={{ padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", backgroundColor: active ? "#FF5A5F" : "#fff", color: active ? "#fff" : "#717171" }}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {hasFilters && (
          <button onClick={() => startTransition(() => router.push(pathname))}
            style={{ fontSize: 13, color: "#FF5A5F", background: "none", border: "none", cursor: "pointer", alignSelf: "flex-end", paddingBottom: 2 }}>
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}