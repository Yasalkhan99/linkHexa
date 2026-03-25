import type { AwinCommissionGroupRange, AwinProgrammeDetails } from "./types";

export type PresentedAwinDetails = {
  commissionSummary: string | null;
  commissionRanges: string[];
  epcFormatted: string | null;
  /** Earnings per click (Awin KPI); shown where the UI previously said "APC". */
  conversionRateDisplay: string | null;
  awinIndex: number | null;
  validationDays: number | null;
  approvalPercentageDisplay: string | null;
  averagePaymentTime: string | null;
  deeplinkEnabled: boolean | null;
};

function formatMoneyRange(min: number, max: number, currencyCode: string): string {
  const cur = currencyCode?.trim() || "USD";
  try {
    const fmt = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 2,
    });
    return min === max ? fmt.format(min) : `${fmt.format(min)} – ${fmt.format(max)}`;
  } catch {
    return min === max ? `${min} ${cur}` : `${min}–${max} ${cur}`;
  }
}

function formatOneRange(r: AwinCommissionGroupRange, currencyCode: string): string {
  const min = r.min ?? 0;
  const max = r.max ?? r.min ?? 0;
  const t = (r.type ?? "").toLowerCase();
  if (t === "percentage") {
    return min === max ? `${min}%` : `${min}% – ${max}%`;
  }
  return formatMoneyRange(min, max, currencyCode);
}

function formatEpc(epc: number | undefined, currencyCode: string): string | null {
  if (epc == null || Number.isNaN(epc)) return null;
  const cur = currencyCode?.trim() || "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 2,
    }).format(epc);
  } catch {
    return String(epc);
  }
}

function formatConversionRate(v: number | undefined): string | null {
  if (v == null || Number.isNaN(v)) return null;
  if (v >= 0 && v <= 1) return `${(v * 100).toFixed(1)}%`;
  return `${Number(v).toFixed(1)}%`;
}

/**
 * Turns raw Awin programmedetails JSON into display-friendly strings for the dashboard.
 */
export function presentAwinProgrammeDetails(
  raw: AwinProgrammeDetails,
  currencyCode: string | null
): PresentedAwinDetails {
  const cur =
    raw.programmeInfo?.currencyCode?.trim() ||
    currencyCode?.trim() ||
    "USD";
  const cr = raw.commissionRange;
  const ranges: AwinCommissionGroupRange[] = Array.isArray(cr)
    ? cr
    : cr && typeof cr === "object"
      ? [cr as AwinCommissionGroupRange]
      : [];
  const commissionRanges = ranges.map((r) => formatOneRange(r, cur));
  const commissionSummary =
    commissionRanges.length > 0 ? commissionRanges.join(" · ") : null;

  const k = raw.kpi;

  return {
    commissionSummary,
    commissionRanges,
    epcFormatted: formatEpc(k?.epc, cur),
    conversionRateDisplay: formatConversionRate(k?.conversionRate),
    awinIndex: k?.awinIndex != null && !Number.isNaN(k.awinIndex) ? k.awinIndex : null,
    validationDays: k?.validationDays != null ? k.validationDays : null,
    approvalPercentageDisplay:
      k?.approvalPercentage != null && !Number.isNaN(k.approvalPercentage)
        ? `${k.approvalPercentage.toFixed(0)}%`
        : null,
    averagePaymentTime: k?.averagePaymentTime?.trim() || null,
    deeplinkEnabled:
      typeof raw.programmeInfo?.deeplinkEnabled === "boolean"
        ? raw.programmeInfo.deeplinkEnabled
        : null,
  };
}
