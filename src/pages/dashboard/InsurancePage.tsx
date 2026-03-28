import React, { useState } from "react";
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

// Mock complaints data
const mockComplaints: Complaint[] = [
  {
    id: "VINCA-INS-2026-0001",
    company: "HDFC Life",
    issueType: "Claim Rejected",
    status: "Registered",
    lastUpdated: "2026-03-05",
    complaintDate: "2026-03-05",
  },
  {
    id: "VINCA-INS-2026-0002",
    company: "ICICI Prudential",
    issueType: "Claim Delay",
    status: "Under Review",
    lastUpdated: "2026-03-06",
    complaintDate: "2026-03-06",
  },
  {
    id: "VINCA-INS-2026-0003",
    company: "Max Bupa",
    issueType: "Policy Issue",
    status: "Resolved",
    lastUpdated: "2026-03-07",
    complaintDate: "2026-03-07",
  },
  {
    id: "VINCA-INS-2026-0004",
    company: "Tata AIG",
    issueType: "Claim Partially Settled",
    status: "Dispute Filed",
    lastUpdated: "2026-03-08",
    complaintDate: "2026-03-08",
  },
  {
    id: "VINCA-INS-2026-0005",
    company: "LIC",
    issueType: "Other Insurance Dispute",
    status: "Closed",
    lastUpdated: "2026-03-04",
    complaintDate: "2026-03-04",
  },
];

// Timeline steps configuration
const timelineSteps: TimelineStep[] = [
  {
    key: "resolution",
    title: "Final Resolution",
    icon: Award,
    description: "Case resolved in your favour",
    completedDate: null,
    expectedDate: "2026-03-30"
  },
  {
    key: "ombudsman",
    title: "Escalation to Insurance Ombudsman",
    icon: Gavel,
    description: "Case escalated for independent review (if required)",
    completedDate: null,
    expectedDate: "2026-03-22"
  },
  {
    key: "dispute-raised",
    title: "Dispute Raised with Insurance Company",
    icon: Mail,
    description: "Formal dispute has been raised with the insurer",
    completedDate: "2026-03-10",
    expectedDate: "2026-03-18"
  },
  {
    key: "samadhan-review",
    title: "Case Review by Insurance Samadhan",
    icon: BookOpen,
    description: "Insurance experts are reviewing your case",
    completedDate: "2026-03-10",
    expectedDate: "2026-03-15"
  },
  {
    key: "documents-forwarded",
    title: "Documents Forwarded to Insurance Samadhan",
    icon: FileUp,
    description: "Your case documents are being shared with our partner",
    completedDate: "2026-03-10",
    expectedDate: "2026-03-12"
  },
  {
    key: "verification-call",
    title: "Client Verification Call",
    icon: Phone,
    description: "We'll call you to verify the case details",
    completedDate: "2026-03-10",
    expectedDate: "2026-03-10"
  },
  {
    key: "vinca-review",
    title: "Case Review by Vinca Team",
    icon: Users,
    description: "Our team is reviewing your complaint details",
    completedDate: "2026-03-09",
    expectedDate: null
  },
  {
    key: "registered",
    title: "Complaint Registered",
    icon: FileText,
    description: "Your complaint has been registered in our system",
    completedDate: "2026-03-08",
    expectedDate: null
  }
];

// Helper functions
const getStepStatus = (complaint: Complaint | null, stepKey: string): "completed" | "active" | "pending" => {
  if (!complaint) return "pending";
  
  const statusMap: Record<string, string[]> = {
    "Registered": ["registered"],
    "Under Review": ["registered", "vinca-review"],
    "Dispute Filed": ["registered", "vinca-review", "verification-call", "documents-forwarded", "samadhan-review", "dispute-raised"],
    "Ombudsman Escalation": ["registered", "vinca-review", "verification-call", "documents-forwarded", "samadhan-review", "dispute-raised", "ombudsman"],
    "Resolved": ["registered", "vinca-review", "verification-call", "documents-forwarded", "samadhan-review", "dispute-raised", "ombudsman", "resolution"],
    "Closed": ["registered", "vinca-review", "verification-call", "documents-forwarded", "samadhan-review", "dispute-raised", "ombudsman", "resolution"],
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

const statusColors: Record<string, string> = {
  Registered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
  "Under Review": "bg-green-200 text-green-800 dark:bg-green-800/30 dark:text-green-200 border-green-300 dark:border-green-700",
  "Awaiting Documents": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "Dispute Filed": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  "Ombudsman Escalation": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  Resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  Closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
};

// Responsive Info Card Component
const InfoCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}> = ({ icon, label, value, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow ${className}`}>
    <div className="flex items-start gap-2 sm:gap-3">
      <div className="bg-green-50 dark:bg-green-900/20 p-1.5 sm:p-2 rounded-lg shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
          {label}
        </p>
        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white break-words">
          {value}
        </p>
      </div>
    </div>
  </div>
);

// Responsive Timeline Step Component
const TimelineStep: React.FC<{
  step: TimelineStep;
  status: "completed" | "active" | "pending";
  isLast: boolean;
  date?: string | null;
  isExpected?: boolean;
}> = ({ step, status, isLast, date, isExpected }) => {
  const Icon = step.icon;
  
  const getStatusStyles = () => {
    switch(status) {
      case "completed":
        return {
          icon: "text-green-600 dark:text-green-400",
          bg: "bg-green-100 dark:bg-green-900/30",
          border: "border-green-300 dark:border-green-700",
          text: "text-gray-900 dark:text-white",
          date: "text-green-600 dark:text-green-400",
          line: "bg-green-300 dark:bg-green-700",
        };
      case "active":
        return {
          icon: "text-green-700 dark:text-green-300",
          bg: "bg-green-200 dark:bg-green-800/50",
          border: "border-green-400 dark:border-green-600",
          text: "text-gray-900 dark:text-white font-medium",
          date: "text-green-700 dark:text-green-300",
          line: "bg-green-400 dark:bg-green-600",
        };
      default:
        return {
          icon: "text-gray-400 dark:text-gray-500",
          bg: "bg-gray-100 dark:bg-gray-800",
          border: "border-gray-200 dark:border-gray-700",
          text: "text-gray-500 dark:text-gray-400",
          date: "text-gray-400 dark:text-gray-500",
          line: "bg-gray-200 dark:bg-gray-700",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="flex gap-3 sm:gap-4 relative group">
      {/* Icon with connector */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${styles.bg} border-2 ${styles.border} flex items-center justify-center z-10 transition-all group-hover:scale-110 shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.icon}`} />
        </div>
        {!isLast && (
          <div className={`w-0.5 h-full min-h-[2rem] ${styles.line} mt-1 transition-all`} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4 sm:pb-6">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`font-semibold text-sm sm:text-base ${styles.text} break-words`}>
                  {step.title}
                </h4>
                {status === "active" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 whitespace-nowrap">
                    In Progress
                  </span>
                )}
              </div>
              {step.description && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 break-words">
                  {step.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Date display - Responsive */}
          {date && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              {!isExpected ? (
                <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${styles.date} shrink-0`} />
              ) : (
                <Hourglass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              )}
              <span className={`${!isExpected ? styles.date : 'text-gray-500 dark:text-gray-400'} break-words`}>
                {!isExpected ? `Completed: ${formatTimelineDate(date)}` : `Expected: ${formatTimelineDate(date)}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Responsive Drawer Component
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
    const foundComplaint = mockComplaints.find(c => c.id === editedId);
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
    
    return [...timelineSteps].sort((a, b) => {
      const statusA = getStepStatus(currentComplaint, a.key);
      const statusB = getStepStatus(currentComplaint, b.key);
      
      const order = { pending: 0, active: 1, completed: 2 };
      return order[statusA] - order[statusB];
    });
  };

  const reorderedSteps = getReorderedTimelineSteps();

  return (
    <div className="bg-muted rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6 lg:p-8 overflow-hidden transition-all hover:shadow-xl">
      {/* Collapsed State Header - Responsive */}
      <div 
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-200 p-2 -m-2 rounded-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Icon section */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-lg shrink-0">
          <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
        </div>
        
        {/* Content section */}
        <div className="flex-1 min-w-0 w-full">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words">
            Track Your Complaint
          </h3>
          
          {hasComplaint && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-wrap">
              {isEditing ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={editedId}
                    onChange={(e) => {
                      setEditedId(e.target.value);
                      setSearchError("");
                    }}
                    onKeyDown={handleKeyPress}
                    className="font-mono text-sm bg-white dark:bg-gray-700 border border-green-300 dark:border-green-600 rounded-md px-2 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
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
                      className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      aria-label="Save"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIdCancel();
                      }}
                      className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      aria-label="Cancel"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md break-all">
                      {currentComplaint?.id}
                    </span>
                    <button
                      className="p-1.5 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors shrink-0"
                      title="Edit Complaint ID"
                      onClick={e => {
                        e.stopPropagation();
                        handleIdEdit();
                      }}
                      aria-label="Edit Complaint ID"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Status badge - visible on mobile when collapsed */}
                  {!isExpanded && currentComplaint && (
                    <span className={`
                      ${statusColors[currentComplaint.status] || statusColors.Registered}
                      px-2.5 py-1 rounded-full text-xs font-medium border
                      sm:mt-0
                    `}>
                      {currentComplaint.status}
                    </span>
                  )}
                </>
              )}
              
              {searchError && (
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {searchError}
                </span>
              )}
            </div>
          )}
          
          {!hasComplaint && !searchError && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              No complaints raised yet
            </p>
          )}
        </div>
        
        {/* Action section - Responsive - Now positioned differently on mobile */}
        <div className="w-full sm:w-auto flex justify-end mt-2 sm:mt-0">
          {hasComplaint && !isExpanded ? (
            /* Mobile: Show View Details button inline with status badge */
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg flex items-center gap-2"
              >
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                  View Details
                </span>
                <ChevronDown className="w-3 h-3 text-green-600 dark:text-green-400" />
              </button>
            </div>
          ) : null}
          
          {/* Desktop: Original View Details button */}
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 sm:gap-3 bg-green-50 dark:bg-green-900/20 px-3 sm:px-4 py-2 rounded-lg">
              <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                {isExpanded ? 'Hide' : 'View Details'}
              </span>
              <div className="bg-white dark:bg-gray-800 rounded-full p-1">
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View Details button when expanded - to hide/show */}
      {hasComplaint && isExpanded && (
        <div className="flex sm:hidden justify-end mt-2 mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg flex items-center gap-2"
          >
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              Hide Details
            </span>
            <ChevronUp className="w-3 h-3 text-green-600 dark:text-green-400" />
          </button>
        </div>
      )}

      {/* Expanded Content - Responsive */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[3000px] opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        {hasComplaint && !searchError && currentComplaint ? (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Info Cards Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <InfoCard
                icon={<Tag className="w-4 h-4 text-green-600 dark:text-green-400" />}
                label="Complaint ID"
                value={currentComplaint.id}
              />
              <InfoCard
                icon={<Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />}
                label="Complaint Date"
                value={formatDate(currentComplaint.complaintDate) || 'N/A'}
              />
              <InfoCard
                icon={<Activity className="w-4 h-4 text-green-600 dark:text-green-400" />}
                label="Issue Type"
                value={currentComplaint.issueType}
              />
              <InfoCard
                icon={<Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />}
                label="Filed Against"
                value={currentComplaint.company}
              />
            </div>

            {/* Timeline Section - Responsive */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-1.5 sm:p-2 rounded-lg">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Complaint Progress Timeline
                </h4>
              </div>
              
              <div className="bg-gray-50/50 dark:bg-gray-700/20 p-4 sm:p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="space-y-2 sm:space-y-0">
                  {reorderedSteps.map((step, index) => {
                    const status = getStepStatus(currentComplaint, step.key);
                    const isCompleted = status === "completed";
                    const isActive = status === "active";
                    
                    return (
                      <TimelineStep
                        key={step.key}
                        step={step}
                        status={status}
                        isLast={index === reorderedSteps.length - 1}
                        date={isCompleted ? step.completedDate : (isActive ? step.expectedDate : step.expectedDate)}
                        isExpected={!isCompleted && step.expectedDate !== null}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center py-6 sm:py-10">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-full blur-xl opacity-70"></div>
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 border-white dark:border-gray-600 shadow-lg">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 px-4">
                {searchError || "No complaints to track"}
              </h4>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-5 max-w-md mx-auto px-4">
                {searchError 
                  ? "The complaint ID you entered does not exist in our system. Please check and try again."
                  : "Once you raise a complaint, you'll be able to track its progress here with real-time updates."}
              </p>
              <button
                className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
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

// Main InsurancePage Component - Responsive
const InsurancePage: React.FC = () => {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState("");
  const [trackError, setTrackError] = useState("");

  const latestComplaint: Complaint | null = mockComplaints.length > 0 
    ? [...mockComplaints].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0]
    : null;

  const handleTrack = () => {
    const found = mockComplaints.find(c => c.id === trackId);
    if (found) {
      setTrackError("");
      navigate(`/dashboard/insurance-support/complaint/${trackId}`);
    } else {
      setTrackError("Complaint ID not found. Please check and try again.");
    }
  };

  // Process steps data
  const processSteps: ProcessStep[] = [
    {
      number: "1",
      icon: Users,
      title: "You Register Your Claim",
      description: "You file your insurance claim and submit the required documents.",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-100 dark:border-green-900/50"
    },
    {
      number: "2",
      icon: Building,
      title: "The Insurance Company Reviews the Claim",
      description: "The insurer evaluates your claim and decides whether it will be approved or rejected.",
      bg: "bg-green-100 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800/50",
      badges: [
        { text: "Approved → Processed", icon: CheckCircle, color: "bg-green-200 dark:bg-green-800" },
        { text: "Rejected/Partial", icon: XCircle, color: "bg-green-300 dark:bg-green-700" }
      ]
    },
    {
      number: "3",
      icon: MessageSquare,
      title: "You Raise a Complaint Through Vinca Wealth",
      description: "If the claim is rejected or partially settled, you can raise a complaint through our platform.",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-100 dark:border-green-900/50"
    },
    {
      number: "4",
      icon: BookOpen,
      title: "We Prepare and Forward Your Case",
      description: "We collect your claim documents and forward the case to our partner Insurance Samadhan for expert review.",
      bg: "bg-green-100 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800/50"
    },
    {
      number: "5",
      icon: Search,
      title: "Experts Review Your Case",
      description: "Insurance Samadhan reviews the details and checks whether the insurer's decision was fair.",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-100 dark:border-green-900/50"
    },
    {
      number: "6",
      icon: Mail,
      title: "We Raise a Dispute With the Insurer",
      description: "If the rejection appears unfair, the case is formally raised with the insurance company for reconsideration.",
      bg: "bg-green-100 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800/50"
    },
    {
      number: "7",
      icon: Scale,
      title: "Escalation to the Insurance Ombudsman (If Required)",
      description: "If the issue is still unresolved, the case may be escalated to the Insurance Ombudsman for independent review.",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-100 dark:border-green-900/50"
    },
    {
      number: "8",
      icon: Award,
      title: "Final Resolution",
      description: "If the decision is in your favour, the insurer processes the rightful claim amount.",
      bg: "bg-green-100 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800/50",
      resolution: true
    }
  ];

  // Feature items
  const features = [
    { icon: Shield, text: "Expert Case Review" },
    { icon: Scale, text: "Legal Expertise" },
    { icon: Clock, text: "Timely Resolution" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <CanonicalPageHeader
        title="Insurance Support & Complaint Tracking"
      />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Raise Complaint Card - Responsive */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div className="bg-muted rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8">
              <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-lg shrink-0">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <div className="flex-1 min-w-0 w-full">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 break-words">
                  Raise New Complaint
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words">
                  Facing issues with your insurance claim? Start a new complaint and get expert assistance.
                </p>
              </div>
              <div className="w-full sm:w-auto flex justify-start sm:justify-end mt-2 sm:mt-0">
                <button
                  className="bg-primary text-white px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:bg-primary/80 transition-all transform hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
                  onClick={() => navigate("/dashboard/insurance-support/new/type")}
                >
                  Raise Complaint
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Tracking Drawer */}
        <ComplaintTrackingDrawer complaint={latestComplaint} navigate={navigate} />

        {/* How We Support You Section - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border border-green-200 dark:border-green-900/30">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
              How We Support You With Insurance Claims
            </h2>
          </div>
          
          <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 break-words">
            If your insurance claim gets rejected or partially settled, you don't have to handle the dispute alone.
            <br className="hidden sm:block" /><br />
            You raise the complaint through Vinca Wealth, and we guide you through the process. 
            We collect the required details, coordinate with our partner Insurance Samadhan, and help escalate the case if needed.
            <br className="hidden sm:block" /><br />
            Here's how the process works.
          </p>

          {/* Process Flow - Responsive */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {processSteps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col sm:flex-row gap-3 sm:gap-4 items-start ${step.bg} p-4 sm:p-5 lg:p-6 rounded-xl border ${step.border}`}
              >
                <div className="bg-green-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg shrink-0">
                  {step.number}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                    {/* Icons only visible on desktop (sm and above) */}
                    <div className="hidden sm:flex items-center gap-2">
                      <step.icon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 shrink-0" />
                      <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 dark:text-white break-words">
                        {step.title}
                      </h3>
                    </div>
                    {/* Title without icon on mobile */}
                    <h3 className="sm:hidden font-semibold text-sm sm:text-base lg:text-lg text-gray-900 dark:text-white break-words">
                      {step.title}
                    </h3>
                    {step.badges && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {step.badges.map((badge, i) => (
                          <span
                            key={i}
                            className={`${badge.color} dark:bg-green-800/50 text-green-700 dark:text-green-200 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap`}
                          >
                            <badge.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                            {badge.text}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 break-words">
                    {step.description}
                  </p>
                  {step.resolution && (
                    <div className="mt-2 sm:mt-3 bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="font-semibold">Claim Amount Received</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Key Features - Responsive grid */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-100 dark:bg-green-800/30 rounded-lg border border-green-200 dark:border-green-700/50"
              >
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 shrink-0" />
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsurancePage;