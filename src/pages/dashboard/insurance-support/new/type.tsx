import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CanonicalPageHeader from "@/components/ui/CanonicalPageHeader";
import img01 from "@/assets/01-is.png";
import img02 from "@/assets/02-is.png";
import img03 from "@/assets/03-is.png";
import img04 from "@/assets/04-is.png";
import img05 from "@/assets/05-is.png";
import img06 from "@/assets/case1.png";
import img07 from "@/assets/case2.png";
import img08 from "@/assets/case3.png";
import img09 from "@/assets/case4.png";
import img10 from "@/assets/case5.png";

import {
  XCircle,
  FileUp,
  Clock,
  BookOpen,
  AlertCircle,
  ChevronLeft,
  Scale,
  Shield,
  Sparkles,
  X
} from "lucide-react";

// Issue type configuration with case studies - using only palette colors
const issueTypes = [
  {
    key: "claim-rejected",
    icon: <XCircle className="w-5 h-5 text-primary" />,
    title: "Claim Rejected",
    shortDescription: "Your claim was rejected citing policy clauses or exclusions.",
    image: img01,
    detailImage: img06,
    caseStudy: `A policyholder was hospitalized after suffering a sudden heart attack only a few months after purchasing a health insurance policy. When the hospitalization claim was submitted with all medical records, the insurer rejected the claim stating that the condition was linked to a previous illness.

However, the treating doctors had never medically connected the two conditions.

Confused and financially stressed after the hospitalization, the policyholder sought professional assistance.

After reviewing the medical reports and hospital documentation, it became clear that the rejection was based on an incorrect interpretation of the policy.

The case was formally escalated through grievance channels and later presented before the Insurance Ombudsman.`,
    outcome: "The Ombudsman directed the insurer to reassess the claim and the full claim amount was approved and paid.",
    bgColor: "bg-destructive/5",
    borderColor: "border-destructive/20",
    iconBg: "bg-destructive/10"
  },
  {
    key: "claim-partially-settled",
    icon: <FileUp className="w-5 h-5 text-primary" />,
    title: "Claim Partially Settled",
    shortDescription: "Your insurer paid only part of the claim amount with unexpected deductions.",
    image: img02,
    detailImage: img07,
    caseStudy: `A policyholder undergoing breast cancer treatment filed a claim after hospitalization. Although all documents were submitted, the insurer approved the claim with a deduction of ₹47,468.

The insurer stated that the treatment exceeded the policy's immunotherapy limit.

However, the hospital records clearly showed that the treatment administered was chemotherapy, not immunotherapy.

Despite multiple grievance requests, the insurer continued to maintain the deduction.

After a detailed review of the medical reports and policy terms, the error in treatment classification was identified.

The dispute was escalated to the Insurance Ombudsman with supporting documentation.`,
    outcome: "The Ombudsman ruled in favour of the policyholder and the deducted amount was released.",
    bgColor: "bg-warning/5",
    borderColor: "border-warning/20",
    iconBg: "bg-warning/10"
  },
  {
    key: "claim-delay",
    icon: <Clock className="w-5 h-5 text-primary" />,
    title: "Claim Delay",
    shortDescription: "Your claim remains pending beyond expected timelines.",
    image: img03,
    detailImage: img08,
    caseStudy: `A policyholder filed a hospitalization claim for his wife who was undergoing treatment for advanced ovarian cancer.

Even after submitting all documents, the claim remained unresolved for several months.

The insurer continued raising additional queries and follow-up requests despite receiving complete documentation.

During this time, the family was dealing with emotional stress along with rising medical expenses.

After reviewing the case, the claim was escalated through formal grievance channels.`,
    outcome: "Before the Ombudsman hearing took place, the insurer reviewed the case again and released the full claim amount.",
    bgColor: "bg-growing/5",
    borderColor: "border-growing/20",
    iconBg: "bg-growing/10"
  },
  {
    key: "policy-issue",
    icon: <BookOpen className="w-5 h-5 text-primary" />,
    title: "Policy Issue",
    shortDescription: "Policy details issued incorrectly or mis-selling by agents.",
    image: img04,
    detailImage: img09,
    caseStudy: `A small business owner approached an insurance agent during the COVID lockdown seeking help to secure a ₹10 lakh loan.

Instead, the agent persuaded him to purchase four life insurance policies which resulted in premiums of nearly ₹1.5 lakh.

Later the policyholder discovered multiple irregularities including lack of income verification and incorrect disclosures during policy issuance.

When the policyholder raised a complaint, the insurer refused to acknowledge any wrongdoing.

The case was escalated to the Insurance Ombudsman where these discrepancies were formally presented.`,
    outcome: "The policies were cancelled and the premiums paid by the policyholder were refunded.",
    bgColor: "bg-living/5",
    borderColor: "border-living/20",
    iconBg: "bg-living/10"
  },
  {
    key: "other",
    icon: <AlertCircle className="w-5 h-5 text-primary" />,
    title: "Other Insurance Dispute",
    shortDescription: "Unique insurance disputes requiring specialized review.",
    image: img05,
    detailImage: img10,
    caseStudy: `After the death of a retired defence serviceman, the nominee submitted all required documents to claim the life insurance benefit.

Despite receiving the complete documentation including official records and certificates, the insurer delayed the claim for over a year.

The insurer repeatedly raised doubts suggesting the death might have been suicide but failed to present supporting evidence.

The case was escalated to the Insurance Ombudsman with full documentation.`,
    outcome: "The Ombudsman ruled in favour of the nominee and directed the insurer to settle the claim.",
    bgColor: "bg-muted",
    borderColor: "border-border",
    iconBg: "bg-accent"
  }
];

// Case Study Modal Component
const CaseStudyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  caseStudy: {
    title: string;
    caseStudy: string;
    outcome: string;
    detailImage: string;
  };
}> = ({ isOpen, onClose, caseStudy }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl mx-auto rounded-xl bg-card border shadow-xl p-6 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Modal content */}
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          {/* Image */}
          <div className="aspect-video rounded-lg bg-muted mb-4 overflow-hidden">
            <img 
              src={caseStudy.detailImage} 
              alt={caseStudy.title}
              className="object-cover w-full h-full"
              onError={(e) => {
                // Fallback for missing images - show a colored div with first letter
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.classList.add('flex', 'items-center', 'justify-center', 'bg-primary/10');
                  const fallback = document.createElement('span');
                  fallback.className = 'text-4xl font-bold text-primary/30';
                  fallback.textContent = caseStudy.title.charAt(0);
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-3">
            {caseStudy.title}
          </h3>

          {/* Case study narrative */}
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mb-4">
            {caseStudy.caseStudy}
          </p>

          {/* Outcome */}
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm font-medium text-green-600">
              Outcome: {caseStudy.outcome}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Card Component - Vertical design with 3-column layout
const IssueCard: React.FC<{
  issue: typeof issueTypes[0];
  onRaiseComplaint: () => void;
  onExploreCase: () => void;
}> = ({ issue, onRaiseComplaint, onExploreCase }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div 
      className={`
        group relative rounded-xl border bg-card overflow-hidden
        hover:shadow-xl hover:border-primary/20
        hover:-translate-y-[2px] transition-all duration-200
        before:absolute before:inset-0 before:rounded-xl before:pointer-events-none
        before:bg-gradient-to-r before:from-transparent before:via-primary/5 before:to-transparent
        before:opacity-0 before:transition-opacity before:duration-500
        hover:before:opacity-100
      `}
    >
      {/* Square image container */}
      <div className="aspect-square rounded-t-xl bg-muted overflow-hidden">
        {!imageError ? (
          <img 
            src={issue.image} 
            alt={issue.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            {React.cloneElement(issue.icon, { 
              className: "w-12 h-12 text-primary/40" 
            })}
          </div>
        )}
      </div>

      {/* Content container */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-base font-semibold mb-1">
          {issue.title}
        </h3>

        {/* Short description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {issue.shortDescription}
        </p>

        {/* Two CTAs */}
        <div className="flex gap-3">
          <button
            onClick={onRaiseComplaint}
            className={`
              flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium
              hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25
              active:scale-[0.98] transition-all duration-150
              relative overflow-hidden group/btn
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
              before:translate-x-[-200%] hover:before:translate-x-[200%]
              before:transition-transform before:duration-700
            `}
          >
            <span className="relative z-10">Raise Complaint</span>
          </button>
          <button
            onClick={onExploreCase}
            className={`
              flex-1 border border-border rounded-lg py-2 text-sm font-medium
              hover:bg-muted hover:border-primary/30
              active:scale-[0.98] transition-all duration-150
            `}
          >
            Explore Case
          </button>
        </div>
      </div>
    </div>
  );
};

const IssueTypeSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState<typeof issueTypes[0] | null>(null);

  const handleRaiseComplaint = (issueKey: string) => {
    navigate(`/dashboard/insurance-support/new/form?type=${issueKey}`);
  };

  const handleExploreCase = (issue: typeof issueTypes[0]) => {
    setSelectedCase(issue);
  };

  const handleCloseModal = () => {
    setSelectedCase(null);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <CanonicalPageHeader title="Choose your case" />
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-primary/[0.02] -z-10" />
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6 relative max-w-full overflow-x-hidden">
        
        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {issueTypes.map((issue) => (
            <IssueCard
              key={issue.key}
              issue={issue}
              onRaiseComplaint={() => handleRaiseComplaint(issue.key)}
              onExploreCase={() => handleExploreCase(issue)}
            />
          ))}
        </div>
        
        {/* Back Link */}
        <div className="w-full mt-8 flex justify-center">
          <button
            className="group inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative px-4 py-2 -mx-4"
            onClick={() => navigate("/dashboard/insurance-support")}
          >
            <div className="absolute -left-4 sm:-left-6 opacity-0 group-hover:opacity-100 group-hover:left-0 transition-all duration-200">
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <span>Back to Insurance Support</span>
          </button>
        </div>
      </div>

      {/* Case Study Modal */}
      {selectedCase && (
        <CaseStudyModal
          isOpen={!!selectedCase}
          onClose={handleCloseModal}
          caseStudy={{
            title: selectedCase.title,
            caseStudy: selectedCase.caseStudy,
            outcome: selectedCase.outcome,
            detailImage: selectedCase.detailImage
          }}
        />
      )}
    </div>
  );
};

export default IssueTypeSelectionPage;