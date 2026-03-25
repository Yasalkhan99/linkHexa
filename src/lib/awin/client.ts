import type { AwinProgramme, AwinProgrammeDetails, AwinPromotionOffer } from "./types";

const AWIN_BASE = "https://api.awin.com";

function getConfig() {
  const token = process.env.AWIN_API_TOKEN?.trim();
  const publisherId = process.env.AWIN_PUBLISHER_ID?.trim();
  return { token, publisherId };
}

export function isAwinConfigured(): boolean {
  const { token, publisherId } = getConfig();
  return Boolean(token && publisherId);
}

/**
 * Fetches programmes from Awin. Omits `relationship` to receive the full catalogue
 * (see Awin docs: Get Program Information).
 */
export async function fetchAwinProgrammes(options?: {
  relationship?: "joined" | "pending" | "suspended" | "rejected" | "notjoined";
  countryCode?: string;
  includeHidden?: boolean;
}): Promise<AwinProgramme[]> {
  const { token, publisherId } = getConfig();
  if (!token || !publisherId) {
    throw new Error("Missing AWIN_API_TOKEN or AWIN_PUBLISHER_ID");
  }

  const url = new URL(`${AWIN_BASE}/publishers/${publisherId}/programmes`);
  url.searchParams.set("accessToken", token);
  if (options?.relationship) url.searchParams.set("relationship", options.relationship);
  if (options?.countryCode) url.searchParams.set("countryCode", options.countryCode);
  if (options?.includeHidden === true) url.searchParams.set("includeHidden", "true");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Awin API ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error("Awin API returned unexpected JSON (expected array)");
  }
  return data as AwinProgramme[];
}

/**
 * Programme KPIs and commission ranges (per-programme call).
 * `advertiserId` is the programme/advertiser id shown in the programmes list (`id` field).
 */
export async function fetchAwinProgrammeDetails(
  advertiserId: number,
  options?: { relationship?: string }
): Promise<AwinProgrammeDetails> {
  const { token, publisherId } = getConfig();
  if (!token || !publisherId) {
    throw new Error("Missing AWIN_API_TOKEN or AWIN_PUBLISHER_ID");
  }

  const url = new URL(`${AWIN_BASE}/publishers/${publisherId}/programmedetails`);
  url.searchParams.set("accessToken", token);
  url.searchParams.set("advertiserId", String(advertiserId));
  if (options?.relationship) {
    url.searchParams.set("relationship", options.relationship);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Awin programmedetails ${res.status}: ${text.slice(0, 200)}`);
  }

  return (await res.json()) as AwinProgrammeDetails;
}

export type AwinGeneratedTrackingLink = {
  url: string;
  /** Awin’s own short link when `shorten: true` was requested (optional). */
  awinShortUrl?: string;
};

/**
 * Wraps a merchant landing URL in an Awin tracking link (Link Builder API).
 * @see https://developer.awin.com/v1-api/apidocs/generatelink
 */
export async function generateAwinTrackingLink(options: {
  advertiserId: number;
  destinationUrl: string;
  parameters?: Record<string, string>;
  shorten?: boolean;
}): Promise<AwinGeneratedTrackingLink> {
  const { token, publisherId } = getConfig();
  if (!token || !publisherId) {
    throw new Error("Missing AWIN_API_TOKEN or AWIN_PUBLISHER_ID");
  }

  const url = new URL(`${AWIN_BASE}/publishers/${publisherId}/linkbuilder/generate`);
  url.searchParams.set("accessToken", token);

  const payload: Record<string, unknown> = {
    advertiserId: options.advertiserId,
    destinationUrl: options.destinationUrl,
    shorten: options.shorten ?? false,
  };
  if (options.parameters && Object.keys(options.parameters).length > 0) {
    payload.parameters = options.parameters;
  }

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    next: { revalidate: 0 },
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const desc = typeof data.description === "string" ? data.description : "";
    const hint = desc || JSON.stringify(data).slice(0, 200);
    throw new Error(`Awin linkbuilder ${res.status}: ${hint}`);
  }

  const trackingUrl = typeof data.url === "string" ? data.url : null;
  if (!trackingUrl) {
    const desc = typeof data.description === "string" ? data.description : "No url in response";
    throw new Error(desc);
  }

  return {
    url: trackingUrl,
    awinShortUrl: typeof data.shortUrl === "string" ? data.shortUrl : undefined,
  };
}

/**
 * Active (and related) offers for one or more advertisers — same data as Awin "My Offers".
 * Path uses singular `publisher` per Awin docs.
 */
export async function fetchAwinPromotions(options: {
  advertiserIds: number[];
  pageSize?: number;
  status?: "active" | "expiringSoon" | "upcoming";
  membership?: "all" | "joined" | "notJoined";
}): Promise<AwinPromotionOffer[]> {
  const { token, publisherId } = getConfig();
  if (!token || !publisherId) {
    throw new Error("Missing AWIN_API_TOKEN or AWIN_PUBLISHER_ID");
  }

  if (!options.advertiserIds.length) {
    return [];
  }

  const url = new URL(`${AWIN_BASE}/publisher/${publisherId}/promotions`);
  url.searchParams.set("accessToken", token);

  const pageSize = Math.min(200, Math.max(10, options.pageSize ?? 50));

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filters: {
        advertiserIds: options.advertiserIds,
        membership: options.membership ?? "all",
        status: options.status ?? "active",
        type: "all",
      },
      pagination: {
        page: 1,
        pageSize,
      },
    }),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Awin promotions ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as unknown;
  return normalizePromotionsPayload(data);
}

function normalizePromotionsPayload(data: unknown): AwinPromotionOffer[] {
  if (Array.isArray(data)) {
    return data as AwinPromotionOffer[];
  }
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.promotions)) return o.promotions as AwinPromotionOffer[];
    if (Array.isArray(o.data)) return o.data as AwinPromotionOffer[];
    if (Array.isArray(o.results)) return o.results as AwinPromotionOffer[];
  }
  return [];
}

export async function testAwinConnection(): Promise<{ ok: true; programmeSampleCount: number } | { ok: false; error: string }> {
  try {
    if (!isAwinConfigured()) {
      return { ok: false, error: "AWIN_API_TOKEN or AWIN_PUBLISHER_ID is not set" };
    }
    const list = await fetchAwinProgrammes({ relationship: "joined" });
    return { ok: true, programmeSampleCount: list.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}
