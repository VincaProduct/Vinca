// UI-only types — disconnected from backend
export type NewReferralTier = "NONE" | "₹500" | "₹1500" | "FREE_PREMIUM"

export interface NewReferralDisplayData {
  successfulReferrals: number  // mock data for UI
  discountEarned: number       // mock data for UI
  rewardUnlocked: NewReferralTier
  referralCode: string         // generated client-side for demo
}

// Mock data state only — no real backend integration
export const MOCK_REFERRAL_STATE: NewReferralDisplayData = {
  successfulReferrals: 0,
  discountEarned: 0,
  rewardUnlocked: "NONE",
  referralCode: "DEMO" + Math.random().toString(36).substring(2, 8).toUpperCase()
}
