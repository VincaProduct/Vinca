import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CanonicalPageHeader from "@/components/ui/CanonicalPageHeader";
import {
  CheckCircle,
  Zap,
  Footprints,
  BookOpen,
  Target,
  Lightbulb,
  Users,
  Rocket,
  TrendingUp,
  BarChart3,
  Sparkles,
  Share2,
  Gift,
  Compass,
  GraduationCap,
  HeartHandshake,
  CalendarClock,
  MessageSquare,
  Eye,
  Trophy
} from "lucide-react";

export default function DashboardPricingPage() {
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinMembership = (code?: string) => {
    setIsJoining(true);
    // TODO: Insert Razorpay trigger here
    setIsJoining(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <CanonicalPageHeader title="Get Financially Ready With Vinca" />

      <div className="mx-auto w-full max-w-6xl px-6 py-10">

        {/* Unified Membership Card */}
        <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm px-6 sm:px-8 py-8 mb-10 w-full max-w-6xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

            {/* LEFT COLUMN */}
            <div className="flex flex-col md:justify-center h-full min-h-[320px]">

              <div className="text-xl sm:text-2xl font-bold text-foreground mb-5 text-center">
                Membership fees & inclusions
              </div>

              <div className="flex items-end gap-3 mb-5 justify-center text-center">
                <span className="text-4xl font-bold text-emerald-600">
                  ₹2500
                </span>
                <span className="text-lg text-muted-foreground">
                  / year
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">

                <Button
                  className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-700"
                  onClick={() => handleJoinMembership()}
                  disabled={isJoining}
                >
                  Join Membership
                </Button>

                <button
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                  onClick={() => setReferralModalOpen(true)}
                >
                  Join with a referral
                </button>

              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col justify-center h-full min-h-[320px]">

              <div className="text-lg font-semibold text-foreground mb-4">
                Full membership includes
              </div>

              <ul className="space-y-3">

                <li className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500"/>
                  Tools to understand your financial reality
                </li>

                <li className="flex gap-3">
                  <Rocket className="h-5 w-5 text-emerald-500"/>
                  Sprints for consistent progress
                </li>

                <li className="flex gap-3">
                  <Footprints className="h-5 w-5 text-emerald-500"/>
                  Footprints to share and learn together
                </li>

                <li className="flex gap-3">
                  <Compass className="h-5 w-5 text-emerald-500"/>
                  Curated resources to support your journey
                </li>

                <li className="flex gap-3">
                  <GraduationCap className="h-5 w-5 text-emerald-500"/>
                  Learning modules for financial clarity
                </li>

                <li className="flex gap-3">
                  <HeartHandshake className="h-5 w-5 text-emerald-500"/>
                  Elevate: optional 1:1 guidance sessions
                </li>

              </ul>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground text-center mt-10">
          SEBI-safe. Education-only platform. No product recommendations.
        </div>

      </div>

      {/* Referral Modal */}
      <Dialog open={referralModalOpen} onOpenChange={setReferralModalOpen}>

        <DialogContent>

          <DialogHeader>
            <DialogTitle>Join with a Referral 🎉</DialogTitle>
            <DialogDescription>
              Add your referral code and continue joining Vinca Premium.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">

            <Label>Referral Code</Label>

            <Input
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e)=>setReferralCode(e.target.value)}
            />

            <DialogFooter>

              <Button
                onClick={()=>{
                  handleJoinMembership(referralCode);
                  setReferralModalOpen(false);
                }}
                disabled={!referralCode || isJoining}
              >
                Join Membership
              </Button>

            </DialogFooter>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  );
}