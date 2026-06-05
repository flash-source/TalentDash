import Link from "next/link";
import { SalaryRecord, DisplayCurrency } from "@/types";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { formatSalary } from "@/lib/salary";

interface Props { record: SalaryRecord; displayCurrency: DisplayCurrency; }

export function SalaryTableRow({ record, displayCurrency }: Props) {
  const fmt = (n: number) => n > 0 ? formatSalary(n, record.currency, displayCurrency, true) : "—";
  return (
    <tr className="border-b border-[#EBEBEB] hover:bg-[#F2F2F2] transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-[#222222]">
        <Link href={`/companies/${record.company_slug}`} className="hover:text-[#FF5A5F] transition-colors">{record.company_name}</Link>
      </td>
      <td className="px-4 py-3 text-sm text-[#484848]">{record.role}</td>
      <td className="px-4 py-3"><LevelBadge level={record.level} /></td>
      <td className="px-4 py-3 text-sm text-[#484848]">{record.location}</td>
      <td className="px-4 py-3 text-sm text-[#717171] text-center">{record.experience_years}y</td>
      <td className="px-4 py-3 text-sm text-[#484848]">{fmt(record.base_salary)}</td>
      <td className="px-4 py-3 text-sm text-[#484848]">{fmt(record.stock)}</td>
      <td className="px-4 py-3"><span className="text-base font-bold text-[#0369A1]">{fmt(record.total_compensation)}</span></td>
    </tr>
  );
}