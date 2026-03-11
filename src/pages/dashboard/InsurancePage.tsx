import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CanonicalPageHeader from "@/components/ui/CanonicalPageHeader";
import { 
  FileText, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  Pencil,
  Shield,
  Users,
  Mail,
  Scale,
  DollarSign,
  XCircle,
  PieChart,
  ArrowRight,
  Building,
  FileCheck,
  MessageSquare,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckCircle2,
  Phone,
  FileUp,
  Gavel,
  Home,
  Calendar,
  Building2,
  Tag,
  Activity,
  Hourglass,
  Sparkles,
  Handshake,
  TrendingUp,
  Target,
  Zap,
  ChevronLeft,
  LucideIcon
} from "lucide-react";

// Types
interface Complaint {
  id: string;
  company: string;
  issueType: string;
  status: string;
  lastUpdated: string;
  complaintDate: string;
}

interface TimelineStep {
  key: string;
  title: string;
  icon: LucideIcon;
  description: string;
  completedDate: string | null;
  expectedDate: string | null;
}

interface StepBadge {
  text: string;
  icon: LucideIcon;
  color: string;
}

interface ProcessStep {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bg: string;
  border: string;
  badges?: StepBadge[];
  resolution?: boolean;
}

// Helper: format issue type from kebab-case
const formatIssueType = (type: string): string => {
  if (!type) return "";
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Helper: load complaints from localStorage
const loadComplaintsFromStorage = (): Complaint[] => {
  try {
    const stored = JSON.parse(localStorage.getItem('insurance-complaints') || '[]');
    return stored.map((c: any) => ({
      id: c.id,
      company: c.insurer,
      issueType: formatIssueType(c.issueType),
      status: c.status,
      lastUpdated: c.lastUpdated,
      complaintDate: c.complaintDate,
    }));
  } catch {
    return [];
  }
};

// Timeline steps configuration - FIXED SEQUENCE (dates populated dynamically)
const timelineSteps: TimelineStep[] = [
  {
    key: "final-resolution",
    title: "Final Resolution",
    icon: Award,
    description: "Case resolved in your favour",
    completedDate: null,
    expectedDate: null
  },
  {
    key: "ombudsman",
    title: "Escalation to Insurance Ombudsman",
    icon: Gavel,
    description: "Case escalated for independent review (if required)",
    completedDate: null,
    expectedDate: null
  },
  {
    key: "dispute-raised",
    title: "Dispute Raised with Insurance Company",
    icon: Mail,
    description: "Formal dispute has been raised with the insurer",
    completedDate: null,
    expectedDate: null
  },
  {
    key: "expert-review",
    title: "Expert Case Review",
    icon: BookOpen,
    description: "Insurance experts are reviewing your case",
    completedDate: null,
    expectedDate: null
  },
  {
    key: "documents-forwarded",
    title: "Documents Forwarded for Expert Review",
    icon: FileUp,
    description: "Your case documents are being reviewed by our partner",
    completedDate: null,
    expectedDate: null
  },
  {
    key: "verification-call",
    title: "Client Verification Call",
    icon: Phone,
    description: "We'll call you to verify the case details",
    completedDate: null,
    expectedDate: null
  },
  {
    key: "initial-review",
    title: "Initial Case Review",
    icon: Users,
    description: "Our team is reviewing your complaint details",
    completedDate: null,
    expectedDate: null
  },
  {
    key: "registered",
    title: "Complaint Registered",
    icon: FileText,
    description: "Your complaint has been registered in our system",
    completedDate: null,
    expectedDate: null
  }
];

// Helper functions
const getStepStatus = (complaint: Complaint | null, stepKey: string): "completed" | "active" | "pending" => {
  if (!complaint) return "pending";
  
  const statusMap: Record<string, string[]> = {
    "Registered": ["registered"],
    "Under Review": ["registered", "initial-review"],
    "Dispute Filed": ["registered", "initial-review", "verification-call", "documents-forwarded", "expert-review", "dispute-raised"],
    "Ombudsman Escalation": ["registered", "initial-review", "verification-call", "documents-forwarded", "expert-review", "dispute-raised", "ombudsman"],
    "Resolved": ["registered", "initial-review", "verification-call", "documents-forwarded", "expert-review", "dispute-raised", "ombudsman", "final-resolution"],
    "Closed": ["registered", "initial-review", "verification-call", "documents-forwarded", "expert-review", "dispute-raised", "ombudsman", "final-resolution"],
  };

  const completedSteps = statusMap[complaint.status] || ["registered"];
  
  if (completedSteps.includes(stepKey)) return "completed";
  if (stepKey === completedSteps[completedSteps.length - 1]) return "active";
  return "pending";
};

const formatDate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatTimelineDate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

// Status color mapping for different complaint statuses
const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    "Registered": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Under Review": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Dispute Filed": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Ombudsman Escalation": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Resolved": "bg-green-500/10 text-green-600 border-green-500/20",
    "Closed": "bg-gray-500/10 text-gray-600 border-gray-500/20",
  };
  
  return statusMap[status] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
};

// Responsive Info Card Component
const InfoCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}> = ({ icon, label, value, className = "" }) => (
  <div className={`bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 p-3 sm:p-4 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-all hover:border-primary/20 ${className}`}>
    <div className="flex items-start gap-2 sm:gap-3">
      <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">
          {label}
        </p>
        <p className="text-sm sm:text-base font-semibold text-foreground break-words">
          {value}
        </p>
      </div>
    </div>
  </div>
);

// Horizontal Timeline Step Component - Premium Design
const HorizontalTimelineStep: React.FC<{
  step: TimelineStep;
  status: "completed" | "active" | "pending";
  showConnector: boolean;
}> = ({ step, status, showConnector }) => {
  const Icon = step.icon;
  const date = step.completedDate || step.expectedDate;
  const isExpected = !step.completedDate && step.expectedDate;
  
  const getStatusStyles = () => {
    switch(status) {
      case "completed":
        return {
          icon: "text-white",
          bg: "bg-primary",
          border: "border-primary",
          ring: "ring-2 ring-primary/20",
          text: "text-foreground",
          date: "text-primary font-medium"
        };
      case "active":
        return {
          icon: "text-white",
          bg: "bg-primary",
          border: "border-primary",
          ring: "ring-2 ring-primary/20 shadow-md",
          text: "text-foreground font-semibold",
          date: "text-primary font-medium"
        };
      default:
        return {
          icon: "text-muted-foreground",
          bg: "bg-muted",
          border: "border-border",
          ring: "",
          text: "text-muted-foreground",
          date: "text-muted-foreground"
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="relative flex flex-col items-center w-[200px] sm:w-[220px] shrink-0 text-center z-10">
      {/* Step Circle with Connector */}
      <div className="relative flex items-center justify-center w-full">
        {/* Left Connector Line */}
        {showConnector && (
          <div className={`absolute right-1/2 top-6 w-1/2 h-[2px] ${
            status === "pending" ? 'bg-border' : 'bg-primary'
          }`} />
        )}
        
        {/* Step Circle */}
        <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border-2 ${styles.border} ${styles.bg} ${styles.ring} transition-all z-10`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.icon}`} />
        </div>

        {/* Right Connector Line */}
        {showConnector && (
          <div className={`absolute left-1/2 top-6 w-1/2 h-[2px] ${
            status === "pending" ? 'bg-border' : 'bg-primary'
          }`} />
        )}
      </div>

      {/* Step Content */}
      <div className="mt-3 space-y-1 px-1">
        <p className={`text-xs sm:text-sm font-semibold ${styles.text} line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]`}>
          {step.title}
        </p>
        
        {date && (
          <p className={`text-[10px] sm:text-xs ${styles.date} flex items-center justify-center gap-1`}>
            {isExpected && <Hourglass className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {formatTimelineDate(date)}
            {isExpected && <span className="text-[8px] sm:text-[10px] text-muted-foreground">(Expected)</span>}
          </p>
        )}
        
        <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
          {step.description}
        </p>
      </div>
    </div>
  );
};

// Horizontal Timeline Container - Premium Design
const HorizontalTimeline: React.FC<{ steps: TimelineStep[]; currentComplaint: Complaint }> = ({ steps, currentComplaint }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const stepsWithStatus = steps.map(step => ({
    ...step,
    status: getStepStatus(currentComplaint, step.key)
  }));

  // Scroll to active step on initial load
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeIndex = stepsWithStatus.findIndex(step => step.status === "active");
      if (activeIndex !== -1) {
        const container = scrollContainerRef.current;
        const children = container.children;
        if (children[activeIndex]) {
          const child = children[activeIndex] as HTMLElement;
          const containerWidth = container.offsetWidth;
          const childWidth = child.offsetWidth;
          const scrollLeft = child.offsetLeft - (containerWidth / 2) + (childWidth / 2);
          
          container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }
    }
  }, []);

  return (
    <div className="w-full">
      {/* Timeline Container */}
      <div className="relative w-full overflow-x-auto scroll-smooth pb-6" ref={scrollContainerRef}>
        {/* Steps Container */}
        <div className="flex items-start gap-0 min-w-[900px] px-2 relative">
          {stepsWithStatus.map((step, index) => (
            <HorizontalTimelineStep
              key={step.key}
              step={step}
              status={step.status}
              showConnector={index > 0 && index < stepsWithStatus.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Responsive Drawer Component - Premium Layout with Mobile Optimizations
const ComplaintTrackingDrawer: React.FC<{ complaint: Complaint | null; navigate: ReturnType<typeof useNavigate> }> = ({ complaint, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedId, setEditedId] = useState(complaint?.id || "");
  const [searchError, setSearchError] = useState("");
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(complaint);

  const hasComplaint = currentComplaint && Object.keys(currentComplaint).length > 0;

  const handleIdEdit = () => {
    setIsEditing(true);
    setEditedId(currentComplaint?.id || "");
    setSearchError("");
  };

  const handleIdSave = () => {
    const complaints = loadComplaintsFromStorage();
    const foundComplaint = complaints.find(c => c.id === editedId);
    if (foundComplaint) {
      setSearchError("");
      setIsEditing(false);
      setCurrentComplaint(foundComplaint);
    } else {
      setSearchError("Complaint does not exist");
      setCurrentComplaint(null);
    }
  };

  const handleIdCancel = () => {
    setIsEditing(false);
    setEditedId(currentComplaint?.id || "");
    setSearchError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleIdSave();
    } else if (e.key === 'Escape') {
      handleIdCancel();
    }
  };

  const getReorderedTimelineSteps = (): TimelineStep[] => {
    if (!currentComplaint) return timelineSteps;
    
    // Populate dates dynamically based on complaint status
    const updatedSteps = timelineSteps.map(step => {
      const status = getStepStatus(currentComplaint, step.key);
      if (status === "completed" || status === "active") {
        return { ...step, completedDate: currentComplaint.complaintDate };
      }
      return step;
    });

    return [...updatedSteps].sort((a, b) => {
      const statusA = getStepStatus(currentComplaint, a.key);
      const statusB = getStepStatus(currentComplaint, b.key);
      
      const order = { pending: 0, active: 1, completed: 2 };
      return order[statusA] - order[statusB];
    });
  };

  const reorderedSteps = getReorderedTimelineSteps();

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-background to-primary/5 p-4 sm:p-5 shadow-sm hover:shadow-md transition">
      {/* Header Section - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left Section - Icon + Content */}
        <div className="flex items-start gap-3">
          {/* Icon Container - Hidden on mobile */}
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-lg bg-primary/15 border border-primary/30 shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>

          {/* Content Stack */}
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Track Your Complaint
            </h3>
            
            {hasComplaint && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedId}
                      onChange={(e) => {
                        setEditedId(e.target.value);
                        setSearchError("");
                      }}
                      onKeyDown={handleKeyPress}
                      className="font-mono text-sm bg-background border-2 border-primary/30 rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-auto"
                      placeholder="Enter Complaint ID"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIdSave();
                        }}
                        className="p-1 text-primary hover:text-primary/80 transition"
                        aria-label="Save"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIdCancel();
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground transition"
                        aria-label="Cancel"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono bg-muted px-2.5 py-1 rounded-md border border-border">
                        {currentComplaint?.id}
                      </span>
                      <button
                        className="p-1 rounded-md hover:bg-muted transition"
                        title="Edit Complaint ID"
                        onClick={e => {
                          e.stopPropagation();
                          handleIdEdit();
                        }}
                        aria-label="Edit Complaint ID"
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    
                    {/* Status Badge */}
                    {!isExpanded && currentComplaint && (
                      <div className="mt-1 sm:mt-0">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${getStatusColor(currentComplaint.status)}`}>
                          {currentComplaint.status}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {searchError && (
                  <span className="text-xs text-destructive font-medium bg-destructive/10 px-2 py-1 rounded">
                    {searchError}
                  </span>
                )}
              </div>
            )}
            
            {!hasComplaint && !searchError && (
              <p className="text-sm text-muted-foreground">
                No complaints raised yet
              </p>
            )}
          </div>
        </div>

        {/* Action Button - Full width on mobile */}
        {hasComplaint && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2 sm:mt-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
            >
              <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Expanded Content - Responsive */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[3000px] opacity-100 mt-6' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        {hasComplaint && !searchError && currentComplaint ? (
          <div className="pt-6 border-t border-border">
            {/* Info Cards Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <InfoCard
                icon={<Tag className="w-4 h-4 text-primary" />}
                label="Complaint ID"
                value={currentComplaint.id}
              />
              <InfoCard
                icon={<Calendar className="w-4 h-4 text-primary" />}
                label="Complaint Date"
                value={formatDate(currentComplaint.complaintDate) || 'N/A'}
              />
              <InfoCard
                icon={<Activity className="w-4 h-4 text-primary" />}
                label="Issue Type"
                value={currentComplaint.issueType}
              />
              <InfoCard
                icon={<Building2 className="w-4 h-4 text-primary" />}
                label="Filed Against"
                value={currentComplaint.company}
              />
            </div>

            {/* Horizontal Timeline Section */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="bg-primary/15 p-1.5 sm:p-2 rounded-lg">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-foreground">
                  Complaint Progress Timeline
                </h4>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4 sm:p-6 lg:p-8 border border-primary/10">
                <HorizontalTimeline 
                  steps={reorderedSteps} 
                  currentComplaint={currentComplaint} 
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-6 border-t border-border">
            <div className="text-center py-6 sm:py-10">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-70"></div>
                <div className="relative bg-primary w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 border-background shadow-xl">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2 px-4">
                {searchError || "No complaints to track"}
              </h4>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-5 max-w-md mx-auto px-4">
                {searchError 
                  ? "The complaint ID you entered does not exist in our system. Please check and try again."
                  : "Once you raise a complaint, our team will start working on it immediately. You'll be able to track every step of the process here."}
              </p>
              <button
                className="group bg-primary text-primary-foreground px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md hover:shadow-lg inline-flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                onClick={() => searchError ? setIsEditing(true) : navigate("/dashboard/insurance-support/new/type")}
              >
                {searchError ? "Try Again" : "Raise Your First Complaint"}
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main InsurancePage Component - Responsive with Mobile Optimizations
const InsurancePage: React.FC = () => {
  const navigate = useNavigate();

  const complaints = loadComplaintsFromStorage();
  const latestComplaint: Complaint | null = complaints.length > 0 
    ? [...complaints].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0]
    : null;

  // Process steps data
  const processSteps: ProcessStep[] = [
    {
      number: "1",
      icon: Users,
      title: "You Register Your Claim",
      description: "You file your insurance claim and submit the required documents to your insurer.",
      bg: "bg-gradient-to-r from-primary/5 to-primary/10",
      border: "border-primary/10"
    },
    {
      number: "2",
      icon: Building,
      title: "Insurance Company Reviews the Claim",
      description: "The insurer evaluates your claim and decides whether it will be approved or rejected.",
      bg: "bg-gradient-to-r from-primary/10 to-primary/15",
      border: "border-primary/20",
      badges: [
        { text: "Approved → Processed", icon: CheckCircle, color: "bg-green-500/10 text-green-600 border-green-500/20" },
        { text: "Rejected/Partial", icon: XCircle, color: "bg-amber-500/10 text-amber-600 border-amber-500/20" }
      ]
    },
    {
      number: "3",
      icon: MessageSquare,
      title: "You Raise a Complaint",
      description: "If the claim is rejected or partially settled, our team is here to help you dispute it.",
      bg: "bg-gradient-to-r from-primary/5 to-primary/10",
      border: "border-primary/10"
    },
    {
      number: "4",
      icon: FileCheck,
      title: "Our Team Prepares Your Case",
      description: "We collect all claim documents and prepare a comprehensive case file for expert review.",
      bg: "bg-gradient-to-r from-primary/10 to-primary/15",
      border: "border-primary/20"
    },
    {
      number: "5",
      icon: BookOpen,
      title: "Expert Case Review",
      description: "We forward your case for detailed expert analysis.",
      bg: "bg-gradient-to-r from-primary/5 to-primary/10",
      border: "border-primary/10"
    },
    {
      number: "6",
      icon: Mail,
      title: "Formal Dispute Raised With Insurer",
      description: "Based on expert recommendations, we formally raise the dispute with your insurance company.",
      bg: "bg-gradient-to-r from-primary/10 to-primary/15",
      border: "border-primary/20"
    },
    {
      number: "7",
      icon: Scale,
      title: "Escalation to Insurance Ombudsman",
      description: "If the insurer doesn't resolve the issue, we help escalate to the Insurance Ombudsman.",
      bg: "bg-gradient-to-r from-primary/5 to-primary/10",
      border: "border-primary/10"
    },
    {
      number: "8",
      icon: Award,
      title: "Final Resolution",
      description: "If the decision is in your favour, the insurer processes the rightful claim amount.",
      bg: "bg-gradient-to-r from-primary/10 to-primary/15",
      border: "border-primary/20",
      resolution: true
    }
  ];

  // Feature items
  const features = [
    { icon: Shield, text: "Expert Case Review" },
    { icon: Scale, text: "Legal Expertise for Ombudsman Escalation" },
    { icon: Clock, text: "End-to-End Case Management" },
    { icon: Target, text: "High Success Rate in Dispute Resolution" },
    { icon: TrendingUp, text: "Maximum Claim Amount Recovery" },
    { icon: Handshake, text: "Partner Network of Insurance Experts" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <CanonicalPageHeader
        title="Insurance Support & Complaint Tracking"
      />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Raise Complaint Card - Mobile Optimized */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-background to-primary/5 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Icon - Hidden on mobile */}
              <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-lg bg-primary/15 border border-primary/30 shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                  Raise New Complaint
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Facing issues with your insurance claim? Our team will review your case and help you get what you deserve.
                </p>
              </div>
              
              {/* Button - Full width on mobile */}
              <div className="w-full sm:w-auto">
                <button
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
                  onClick={() => navigate("/dashboard/insurance-support/new/type")}
                >
                  Raise Complaint
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Tracking Drawer */}
        <ComplaintTrackingDrawer complaint={latestComplaint} navigate={navigate} />

        {/* How We Support You Section - Premium Layout */}
        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-background to-primary/5 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-primary/15 border border-primary/30">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-foreground">
              How We Support You With Insurance Claims
            </h2>
          </div>
          
          <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
            When your insurance claim gets rejected or partially settled, you don't have to handle the dispute alone.
            <br className="hidden sm:block" /><br />
            <span className="bg-primary/10 px-2 py-1 rounded-md font-medium text-foreground">
              You raise the complaint, and our team manages everything.
            </span>
            <br className="hidden sm:block" /><br />
            We collect your case details, coordinate expert review, and handle all communication with the insurance company. If needed, we escalate to the Insurance Ombudsman.
          </p>

          {/* Process Flow - Premium Layout */}
          <div className="space-y-3">
            {processSteps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col sm:flex-row gap-3 sm:gap-4 items-start ${step.bg} p-4 rounded-xl border ${step.border} hover:shadow-md transition-all hover:scale-[1.01]`}
              >
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {step.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                    <div className="hidden sm:flex items-center gap-2">
                      <step.icon className="w-4 h-4 text-primary shrink-0" />
                      <h3 className="font-semibold text-sm text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <h3 className="sm:hidden font-semibold text-sm text-foreground">
                      {step.title}
                    </h3>
                    {step.badges && (
                      <div className="flex flex-wrap gap-1.5">
                        {step.badges.map((badge, i) => (
                          <span
                            key={i}
                            className={`${badge.color} px-2 py-0.5 rounded-full text-xs flex items-center gap-1 whitespace-nowrap border`}
                          >
                            <badge.icon className="w-3 h-3" />
                            {badge.text}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                  {step.resolution && (
                    <div className="mt-2 bg-green-500/10 text-green-600 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-xs border border-green-500/20">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="font-semibold">Claim Amount Successfully Recovered</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Key Features Grid - Premium Layout */}
          {/* Removed feature cards as requested */}

          {/* Partner Attribution Footer */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                  <Handshake className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    In Association With
                  </p>
                  <p className="text-base font-bold text-primary">
                    Insurance Samadhan
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center sm:text-right">
                India's leading insurance dispute resolution platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsurancePage;