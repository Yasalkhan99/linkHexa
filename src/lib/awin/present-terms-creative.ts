import type { AwinProgrammeDetails, AwinPromotionOffer } from "./types";

export type PresentedTermsSection = {
  id: string;
  title: string;
  body: string;
};

export type PresentedTerms = {
  sections: PresentedTermsSection[];
};

export type PresentedPromotion = {
  promotionId: number;
  type: string;
  title: string;
  description: string | null;
  terms: string | null;
  startDate: string | null;
  endDate: string | null;
  url: string | null;
  urlTracking: string | null;
  voucherCode: string | null;
  imageUrl: string | null;
};

function domainLine(d: unknown): string {
  if (d && typeof d === "object" && "domain" in d && typeof (d as { domain?: string }).domain === "string") {
    return (d as { domain: string }).domain;
  }
  return "";
}

/**
 * Terms-style copy from programmedetails + offer-level `terms` from promotions.
 */
export function buildAwinTermsSections(
  details: AwinProgrammeDetails | null,
  promotionOffers: PresentedPromotion[]
): PresentedTerms {
  const sections: PresentedTermsSection[] = [];
  const info = details?.programmeInfo;

  if (info?.description?.trim()) {
    sections.push({
      id: "awin-programme-description",
      title: "Programme description (Awin)",
      body: info.description.trim(),
    });
  }

  const domains = info?.validDomains;
  if (Array.isArray(domains) && domains.length > 0) {
    const lines = domains.map(domainLine).filter(Boolean);
    if (lines.length > 0) {
      sections.push({
        id: "awin-valid-domains",
        title: "Accepted transaction domains",
        body: lines.map((d) => `· ${d}`).join("\n"),
      });
    }
  }

  const tt = info?.trackingTransparency;
  if (Array.isArray(tt) && tt.length > 0) {
    sections.push({
      id: "awin-tracking-transparency",
      title: "Tracking transparency",
      body: tt.map(String).join("\n"),
    });
  } else if (typeof tt === "string" && tt.trim()) {
    sections.push({
      id: "awin-tracking-transparency",
      title: "Tracking transparency",
      body: tt.trim(),
    });
  }

  if (info?.linkStatus?.trim()) {
    sections.push({
      id: "awin-link-status",
      title: "Link status",
      body: info.linkStatus.trim(),
    });
  }

  if (info?.primarySector?.trim()) {
    sections.push({
      id: "awin-primary-sector",
      title: "Primary sector",
      body: info.primarySector.trim(),
    });
  }

  if (info?.membershipStatus?.trim()) {
    sections.push({
      id: "awin-membership",
      title: "Membership status (Awin)",
      body: info.membershipStatus.trim(),
    });
  }

  for (const p of promotionOffers) {
    const t = p.terms?.trim();
    if (!t) continue;
    const label = p.title?.trim() ? `Offer terms: ${p.title.trim()}` : "Offer terms";
    sections.push({
      id: `awin-offer-terms-${p.promotionId}`,
      title: label,
      body: t,
    });
  }

  return { sections };
}

function pickImageUrl(raw: Record<string, unknown>): string | null {
  const keys = ["imageUrl", "bannerUrl", "creativeUrl", "image", "bannerImageUrl"] as const;
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === "string" && v.startsWith("http")) return v;
  }
  return null;
}

export function presentPromotionOffers(offers: AwinPromotionOffer[]): PresentedPromotion[] {
  return offers.map((raw, index) => {
    const r = raw as Record<string, unknown>;
    const idRaw = r.promotionId;
    const promotionId =
      typeof idRaw === "number"
        ? idRaw
        : typeof idRaw === "string" && /^\d+$/.test(idRaw)
          ? Number(idRaw)
          : index;

    const v = r.voucher as Record<string, unknown> | undefined;
    const code = v && typeof v.code === "string" ? v.code : null;

    const img =
      pickImageUrl(r) ||
      (typeof raw.imageUrl === "string" && raw.imageUrl.startsWith("http") ? raw.imageUrl : null) ||
      (typeof raw.bannerUrl === "string" && raw.bannerUrl.startsWith("http") ? raw.bannerUrl : null);

    return {
      promotionId,
      type: typeof raw.type === "string" ? raw.type : "promotion",
      title: typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : "Untitled offer",
      description: typeof raw.description === "string" && raw.description.trim() ? raw.description.trim() : null,
      terms: typeof raw.terms === "string" && raw.terms.trim() ? raw.terms.trim() : null,
      startDate: typeof raw.startDate === "string" ? raw.startDate : null,
      endDate: typeof raw.endDate === "string" ? raw.endDate : null,
      url: typeof raw.url === "string" && raw.url.startsWith("http") ? raw.url : null,
      urlTracking: typeof raw.urlTracking === "string" && raw.urlTracking.startsWith("http") ? raw.urlTracking : null,
      voucherCode: code,
      imageUrl: img,
    };
  });
}
