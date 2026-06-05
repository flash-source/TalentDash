"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatSalary, formatDelta } from "@/lib/salary";

interface SalaryRecord {
  id: string; company_name: string; company_slug: string;
  role: string; level: string; location: string; currency: string;
  experience_years: number; base_salary: number; bonus: number;
  stock: number; total_compensation: number;
}

interface CompareDelta {
  base_delta: number; bonus_delta: number; stock_delta: number;
  tc_delta: number; experience_delta: number;
}

interface CompareResult { record1: SalaryRecord; record2: SalaryRecord; delta: CompareDelta; }

const LEVEL_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  L3: { bg: "#f1f5f9", color: "#475569", label: "L3" },
  L4: { bg: "#dbeafe", color: "#1d4ed8", label: "L4" },
  L5: { bg: "#e0e7ff", color: "#4338ca", label: "L5" },
  L6: { bg: "#f3e8ff", color: "#7e22ce", label: "L6" },
  SDE_I:     { bg: "#f1f5f9", color: "#475569", label: "SDE-I"     },
  SDE_II:    { bg: "#dbeafe", color: "#1d4ed8", label: "SDE-II"    },
  SDE_III:   { bg: "#e0e7ff", color: "#4338ca", label: "SDE-III"   },
  STAFF:     { bg: "#f3e8ff", color: "#7e22ce", label: "Staff"     },
  PRINCIPAL: { bg: "#1e1b4b", color: "#fff",    label: "Principal" },
  IC4:       { bg: "#dbeafe", color: "#1d4ed8", label: "IC4"       },
  IC5:       { bg: "#e0e7ff", color: "#4338ca", label: "IC5"       },
};

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allRecords, setAllRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const s1 = searchParams.get("s1") ?? "";
  const s2 = searchParams.get("s2") ?? "";

  useEffect(() => {
    fetch("/api/salaries?limit=100&sort=total_comp_desc")
      .then((r) => r.json())
      .then((d) => { setAllRecords(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fetchCompare = useCallback(async (id1: string, id2: string) => {
    if (!id1 || !id2) { setResult(null); return; }
    setComparing(true); setError(null);
    try {
      const res = await fetch(`/api/compare?s1=${id1}&s2=${id2}`);
      const body = await res.json();
      if (!res.ok) { setError(body.message ?? "Failed to compare"); setResult(null); }
      else setResult(body);
    } catch { setError("Network error"); }
    finally { setComparing(false); }
  }, []);

  useEffect(() => { if (s1 && s2) fetchCompare(s1, s2); }, [s1, s2, fetchCompare]);

  function selectRecord(slot: "s1" | "s2", id: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.set(slot, id);
    router.push(`/compare?${p.toString()}`);
  }

  const FIELDS: { key: keyof CompareDelta; label: string; isExp?: boolean }[] = [
    { key: "base_delta",       label: "Base Salary"  },
    { key: "bonus_delta",      label: "Bonus"        },
    { key: "stock_delta",      label: "Stock / RSU"  },
    { key: "tc_delta",         label: "Total Comp"   },
    { key: "experience_delta", label: "Experience", isExp: true },
  ];

  function fmtField(r: SalaryRecord, key: keyof CompareDelta): string {
    switch (key) {
      case "base_delta":       return formatSalary(r.base_salary, r.currency, "INR", true);
      case "bonus_delta":      return r.bonus > 0 ? formatSalary(r.bonus, r.currency, "INR", true) : "—";
      case "stock_delta":      return r.stock > 0 ? formatSalary(r.stock, r.currency, "INR", true) : "—";
      case "tc_delta":         return formatSalary(r.total_compensation, r.currency, "INR", true);
      case "experience_delta": return `${r.experience_years}y`;
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#222222", margin: "0 0 6px" }}>Compare Offers</h1>
        <p style={{ fontSize: 14, color: "#717171", margin: 0 }}>Select two salary records to compare side-by-side</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {(["s1", "s2"] as const).map((slot, i) => (
          <div key={slot} style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#717171", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>
              Record {i + 1}
            </span>
            {loading ? (
              <div style={{ height: 40, backgroundColor: "#F7F7F7", borderRadius: 6 }} />
            ) : (
              <select value={slot === "s1" ? s1 : s2} onChange={(e) => selectRecord(slot, e.target.value)}
                style={{ width: "100%", border: "1px solid #EBEBEB", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#222222", backgroundColor: "#fff", outline: "none" }}>
                <option value="">Select a record…</option>
                {allRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.company_name} · {r.role} · {LEVEL_BADGE[r.level]?.label ?? r.level} · {r.location} · {formatSalary(r.total_compensation, r.currency, "INR", true)}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ backgroundColor: "#FCEBEB", border: "1px solid #D93025", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#791F1F", marginBottom: 20 }}>
          {error}
        </div>
      )}

      {comparing && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#717171", fontSize: 14 }}>Loading comparison…</div>
      )}

      {result && !comparing && (() => {
        const { record1: r1, record2: r2, delta } = result;
        const winner = delta.tc_delta > 0 ? 1 : delta.tc_delta < 0 ? 2 : 0;
        return (
          <div style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr 140px", borderBottom: "1px solid #EBEBEB" }}>
              <div style={{ padding: 16, fontSize: 11, fontWeight: 600, color: "#717171", textTransform: "uppercase", letterSpacing: "0.05em" }}>Field</div>
              {[r1, r2].map((r, i) => (
                <div key={r.id} style={{ padding: 16, borderLeft: "1px solid #EBEBEB" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#222222" }}>{r.company_name}</span>
                    {winner === i + 1 && <span style={{ fontSize: 11, backgroundColor: "#0369A1", color: "#fff", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>Higher TC</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ backgroundColor: LEVEL_BADGE[r.level]?.bg ?? "#F7F7F7", color: LEVEL_BADGE[r.level]?.color ?? "#484848", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4 }}>
                      {LEVEL_BADGE[r.level]?.label ?? r.level}
                    </span>
                    <span style={{ fontSize: 12, color: "#717171" }}>{r.location}</span>
                  </div>
                </div>
              ))}
              <div style={{ padding: 16, borderLeft: "1px solid #EBEBEB", fontSize: 11, fontWeight: 600, color: "#717171", textTransform: "uppercase", letterSpacing: "0.05em" }}>Delta</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr 140px", borderBottom: "1px solid #EBEBEB" }}>
              <div style={{ padding: "14px 16px", fontSize: 13, color: "#717171" }}>Role</div>
              <div style={{ padding: "14px 16px", fontSize: 13, color: "#484848", borderLeft: "1px solid #EBEBEB" }}>{r1.role}</div>
              <div style={{ padding: "14px 16px", fontSize: 13, color: "#484848", borderLeft: "1px solid #EBEBEB" }}>{r2.role}</div>
              <div style={{ padding: "14px 16px", fontSize: 13, color: "#717171", borderLeft: "1px solid #EBEBEB" }}>—</div>
            </div>
            {FIELDS.map(({ key, label, isExp }) => {
              const dv = delta[key];
              const isTC = key === "tc_delta";
              const { text, positive } = isExp
                ? { text: dv > 0 ? `+${dv}y` : dv < 0 ? `${dv}y` : "Equal", positive: dv >= 0 }
                : formatDelta(dv, "INR");
              return (
                <div key={key} style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr 140px", borderBottom: "1px solid #F0F0F0" }}>
                  <div style={{ padding: "14px 16px", fontSize: 13, color: "#717171" }}>{label}</div>
                  <div style={{ padding: "14px 16px", borderLeft: "1px solid #EBEBEB", fontSize: isTC ? 17 : 13, fontWeight: isTC ? 800 : 400, color: isTC ? "#0369A1" : "#484848" }}>{fmtField(r1, key)}</div>
                  <div style={{ padding: "14px 16px", borderLeft: "1px solid #EBEBEB", fontSize: isTC ? 17 : 13, fontWeight: isTC ? 800 : 400, color: isTC ? "#0369A1" : "#484848" }}>{fmtField(r2, key)}</div>
                  <div style={{ padding: "14px 16px", borderLeft: "1px solid #EBEBEB", fontSize: 13, fontWeight: 600, color: dv === 0 ? "#717171" : positive ? "#008A05" : "#D93025" }}>
                    {dv === 0 ? "Equal" : text}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {!s1 && !s2 && !loading && (
        <div style={{ backgroundColor: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: "64px 32px", textAlign: "center", color: "#717171", fontSize: 14 }}>
          Select two records above to see a side-by-side comparison.
        </div>
      )}
    </div>
  );
}