/**
 * PMS (Portfolio Management Services) on the website. Vinca can only promote
 * PMS as an APMI-registered distributor, so everything about PMS stays hidden
 * until the APRN is filled in here. Set it once, e.g. 'APRN-12345', and the
 * homepage hero, trust line, services card and PMS risk note all switch on.
 * Must not import anything that uses the "@/" alias (used by the edge function).
 */
export const PMS_APRN: string | null = 'APRN09071';

export const PMS_ENABLED = PMS_APRN !== null && PMS_APRN.trim() !== '';

/** SEBI's minimum investment for PMS */
export const PMS_MINIMUM = '₹50 lakh';

export const PMS_RISK_NOTE =
  'PMS investments are subject to market risks. The minimum investment is ₹50 lakh. Read the Disclosure Document carefully before investing.';
