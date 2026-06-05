"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

interface Props { page: number; totalPages: number; total: number; limit: number; }

export function Pagination({ page, totalPages, total, limit }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  if (totalPages <= 1) return null;

  const btn = (disabled: boolean) => ({
    padding: "8px 16px", fontSize: 13, borderRadius: 8,
    border: "1px solid #EBEBEB", backgroundColor: "#fff",
    color: disabled ? "#BEBEBE" : "#484848",
    cursor: disabled ? "not-allowed" : "pointer", fontWeight: 500 as const,
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "0 4px" }}>
      <p style={{ fontSize: 13, color: "#717171", margin: 0 }}>
        Showing <strong style={{ color: "#484848" }}>{start}–{end}</strong> of{" "}
        <strong style={{ color: "#484848" }}>{total}</strong> records
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button disabled={page <= 1} onClick={() => goTo(page - 1)} style={btn(page <= 1)}>Previous</button>
        <span style={{ fontSize: 13, color: "#717171" }}>{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => goTo(page + 1)} style={btn(page >= totalPages)}>Next</button>
      </div>
    </div>
  );
}