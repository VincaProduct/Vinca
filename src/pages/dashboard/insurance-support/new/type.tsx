import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CanonicalPageHeader from "@/components/ui/CanonicalPageHeader";
import {
  XCircle,
  FileUp,
  Clock,
  BookOpen,
  AlertCircle,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  Scale,
  Shield,
  Sparkles
} from "lucide-react";

// Issue type configuration with case studies - using only palette colors
const issueTypes = [
  {
    key: "claim-rejected",
    icon: <XCircle className="w-5 h-5 text-primary" />,
    title: "Claim Rejected",
    shortDescription: "Claim rejected citing policy exclusions. We helped challenge the insurer.",
    summary: "A policyholder's health insurance claim was rejected citing policy exclusions. After reviewing the documents, our team worked with Insurance Samadhan to challenge the rejection with the insurer.",
    outcome: "The case was escalated with proper documentation and the insurer eventually approved the claim amount.",
    fullCaseStudy: `In this case the policyholder's hospitalization claim was rejected citing a policy clause. After reviewing the policy wording and medical records, the team identified that the rejection interpretation was incorrect.
    
Insurance Samadhan raised the dispute with the insurer and escalated the case through formal communication channels. After review, the insurer reconsidered the claim and processed the payment.`,
    bgColor: "bg-destructive/5",
    borderColor: "border-destructive/20",
    iconBg: "bg-destructive/10"
  },
  {
    key: "claim-partially-settled",
    icon: <FileUp className="w-5 h-5 text-primary" />,
    title: "Claim Partially Settled",
    shortDescription: "Only part of your claim was paid, with unexpected deductions applied.",
    summary: "A customer received only partial settlement of their claim amount. After reviewing the settlement calculation, the dispute was raised with the insurer.",
    outcome: "The insurer reviewed the calculation and processed the remaining amount.",
    fullCaseStudy: `The insurer approved the claim but deducted a large portion citing policy limits. Our partner team reviewed the settlement sheet and identified incorrect deductions.
    
After raising a dispute with supporting documentation, the insurer re-evaluated the claim and paid the balance amount.`,
    bgColor: "bg-warning/5",
    borderColor: "border-warning/20",
    iconBg: "bg-warning/10"
  },
  {
    key: "claim-delay",
    icon: <Clock className="w-5 h-5 text-primary" />,
    title: "Claim Delay",
    shortDescription: "Claim pending beyond expected timelines despite follow-ups.",
    summary: "A claim remained pending for months without resolution. The case was escalated through formal grievance channels.",
    outcome: "The insurer processed the claim after escalation.",
    fullCaseStudy: `The customer's claim remained pending beyond the expected processing period. Multiple follow-ups had not resolved the issue.
    
Through formal escalation and structured communication with the insurer, the claim was reviewed and processed.`,
    bgColor: "bg-growing/5",
    borderColor: "border-growing/20",
    iconBg: "bg-growing/10"
  },
  {
    key: "policy-issue",
    icon: <BookOpen className="w-5 h-5 text-primary" />,
    title: "Policy Issue",
    shortDescription: "Incorrect policy details, issuance, or documentation problems.",
    summary: "The policyholder faced issues related to incorrect policy details and discrepancies.",
    outcome: "After review and coordination with the insurer, the policy details were corrected.",
    fullCaseStudy: `In this case the customer discovered discrepancies in the issued policy document.
    
The case was reviewed and the insurer updated the policy records to reflect the correct details.`,
    bgColor: "bg-living/5",
    borderColor: "border-living/20",
    iconBg: "bg-living/10"
  },
  {
    key: "other",
    icon: <AlertCircle className="w-5 h-5 text-primary" />,
    title: "Other Insurance Dispute",
    shortDescription: "Unique insurance disputes not covered by standard categories.",
    summary: "Some disputes do not fall under standard categories and require individual review.",
    outcome: "Such cases are reviewed individually and escalated when required.",
    fullCaseStudy: `Certain insurance issues involve unique situations not covered by standard categories.
    
In such cases, the complaint is reviewed individually and appropriate escalation channels are used to resolve the dispute.`,
    bgColor: "bg-muted",
    borderColor: "border-border",
    iconBg: "bg-accent"
  }
];

// Expandable Case Study Component - Redesigned premium version with mobile improvements
const ExpandableCaseStudy: React.FC<{ 
  content: string; 
  summary: string;
  outcome: string;
}> = ({ content, summary, outcome }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full">
      {/* Case study toggle - always visible with improved touch target */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary/70 hover:text-primary transition-all group py-2 -ml-1 px-1"
      >
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>View successful case study</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>
      {/* Expandable drawer - full width below */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100 mt-2 sm:mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="w-full bg-muted/40 border border-border rounded-lg p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            {/* Summary */}
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              {summary}
            </p>
            {/* Outcome - now in destructive color */}
            <div>
              <span className="text-xs sm:text-sm font-medium text-destructive">
                Outcome: {outcome}
              </span>
            </div>
            {/* Full case study */}
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Issue Section Component - Restructured with mobile-first approach
const IssueSection: React.FC<{
  issue: typeof issueTypes[0];
  onRaiseComplaint: () => void;
}> = ({ issue, onRaiseComplaint }) => {
  return (
    <div 
      className={`
        w-full rounded-xl border bg-card
        hover:shadow-lg hover:border-primary/20
        hover:-translate-y-[1px] transition-all duration-200 p-3 sm:p-4
        relative overflow-hidden
        before:absolute before:inset-0 before:rounded-xl before:pointer-events-none
        before:bg-gradient-to-r before:from-transparent before:via-primary/5 before:to-transparent
        before:opacity-0 before:transition-opacity before:duration-500
        hover:before:opacity-100
      `}
    >
      {/* Main row - stacked on mobile, row on larger screens */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
        {/* Left side: Icon + Title + Description - improved mobile layout */}
        <div className="flex items-start gap-3 sm:items-center sm:gap-4 flex-1 min-w-0">
          {/* Icon container with gradient */}
          <div className={`
            relative p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5
            ring-1 ring-primary/10 group-hover:ring-primary/20 transition-all shrink-0
          `}>
            {React.cloneElement(issue.icon, { 
              className: "w-4 h-4 sm:w-5 sm:h-5 text-primary" 
            })}
          </div>
          {/* Title and description - improved text wrapping */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-foreground break-words">
              {issue.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground break-words leading-snug sm:leading-relaxed">
              {issue.shortDescription}
            </p>
          </div>
        </div>
        {/* Right side: Raise Complaint button - full width on mobile */}
        <button
          onClick={onRaiseComplaint}
          className={`
            inline-flex items-center justify-center sm:justify-start gap-2 
            px-4 sm:px-5 py-2.5 sm:py-2.5 
            text-sm font-medium rounded-lg
            bg-primary text-primary-foreground 
            hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25
            active:scale-[0.98] transition-all duration-150
            shrink-0 relative overflow-hidden group/btn
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
            before:translate-x-[-200%] hover:before:translate-x-[200%]
            before:transition-transform before:duration-700
            w-full sm:w-auto
          `}
        >
          <span className="relative z-10">Raise Complaint</span>
          <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
      {/* Case study section - inside card, below the row - mobile optimized */}
      <div className="w-full mt-2 sm:mt-3 pl-0 sm:pl-12">
        <ExpandableCaseStudy 
          content={issue.fullCaseStudy}
          summary={issue.summary}
          outcome={issue.outcome}
        />
      </div>
    </div>
  );
};

const IssueTypeSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRaiseComplaint = (issueKey: string) => {
    navigate(`/dashboard/insurance-support/new/form?type=${issueKey}`);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <CanonicalPageHeader title="Raise New Insurance Complaint" />
      {/* Subtle background pattern - adjusted for mobile */}
      <div className="absolute inset-0 bg-grid-primary/[0.02] -z-10" />
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6 relative max-w-full overflow-x-hidden">
        {/* Header Section with premium styling - mobile optimized */}
        <div className="w-full mb-6 sm:mb-8">
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Choose your insurance issue below. Each type includes a real case study showing how we've helped customers resolve similar disputes.
          </p>
        </div>
        
        {/* Issue Sections Stack - Compact vertical spacing with mobile improvements */}
        <div className="w-full space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {issueTypes.map((issue, index) => (
            <React.Fragment key={issue.key}>
              <IssueSection
                issue={issue}
                onRaiseComplaint={() => handleRaiseComplaint(issue.key)}
              />
              {/* Subtle separator except for last item - hidden on very small screens */}
              {index < issueTypes.length - 1 && (
                <div className="relative flex justify-center">
                  <div className="h-3 sm:h-4 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Back Link with premium styling - mobile optimized */}
        <div className="w-full mt-6 sm:mt-8 flex justify-center">
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
    </div>
  );
};

export default IssueTypeSelectionPage;