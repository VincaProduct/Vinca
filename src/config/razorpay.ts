export const razorpayConfig = {
  // Test mode key (will be replaced with live key in production)
  keyId: "rzp_test_RXC7OYSlf7trWG", // Get from Razorpay Dashboard → Settings → API Keys
  currency: "INR",
  companyName: "Vinca Wealth",
  theme: {
    color: "#10b981", // Primary green color for Razorpay UI
  },
  plans: {
    pro_lifetime: {
      name: "Pro Version - Lifetime Access",
      amount: 2500000, // ₹25,000 in paise
      description: "One-time payment for lifetime access to all Pro features",
    },
  },
};
