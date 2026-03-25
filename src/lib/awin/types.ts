/** Shape returned by GET /publishers/{publisherId}/programmes (Awin). */
export type AwinProgramme = {
  id: number;
  name: string;
  description?: string;
  displayUrl?: string;
  logoUrl?: string;
  clickThroughUrl?: string;
  currencyCode?: string;
  status?: string;
  primaryRegion?: { name?: string; countryCode?: string };
};

/** Commission group range from GET /programmedetails. */
export type AwinCommissionGroupRange = {
  min?: number;
  max?: number;
  type?: string;
};

/** KPI block from GET /programmedetails. */
export type AwinProgrammeKpi = {
  approvalPercentage?: number;
  averagePaymentTime?: string;
  awinIndex?: number;
  conversionRate?: number;
  epc?: number;
  validationDays?: number;
};

/** Domain entry from programmedetails programmeInfo.validDomains. */
export type AwinValidDomain = {
  domain?: string;
};

/** programmeInfo from GET /programmedetails (extends published fields). */
export type AwinProgrammeDetailsInfo = {
  id?: number;
  name?: string;
  description?: string;
  displayUrl?: string;
  clickThroughUrl?: string;
  deeplinkEnabled?: boolean;
  currencyCode?: string;
  logoUrl?: string;
  membershipStatus?: string;
  primaryRegion?: { name?: string; countryCode?: string };
  primarySector?: string;
  validDomains?: AwinValidDomain[];
  /** Methods available for this programme (Awin). */
  trackingTransparency?: string[] | string;
  linkStatus?: string;
};

/** Shape returned by GET /publishers/{publisherId}/programmedetails. */
export type AwinProgrammeDetails = {
  commissionRange?: AwinCommissionGroupRange[] | AwinCommissionGroupRange;
  kpi?: AwinProgrammeKpi;
  programmeInfo?: AwinProgrammeDetailsInfo;
};

/** One offer row from POST /publisher/{publisherId}/promotions (see Awin Retrieve Offers). */
export type AwinPromotionOffer = {
  promotionId?: number;
  type?: string;
  title?: string;
  description?: string;
  terms?: string;
  startDate?: string;
  endDate?: string;
  dateAdded?: string;
  url?: string;
  urlTracking?: string;
  advertiser?: { id?: number; name?: string; joined?: boolean };
  regions?: { all?: boolean; list?: { name?: string; countryCode?: string }[] };
  voucher?: { code?: string | null; exclusive?: boolean; attributable?: boolean };
  /** Not always present; pass through when Awin adds assets. */
  imageUrl?: string;
  bannerUrl?: string;
};
