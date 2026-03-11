import React, { useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CanonicalPageHeader from "@/components/ui/CanonicalPageHeader";
import { CheckCircle2, FileText, Calendar, Building2, Hash, User, IndianRupee, Clock, ArrowRight, ListChecks, Copy, ExternalLink } from "lucide-react";

const SuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { form, issueType } = (location.state as any) || {};

  // Format issue type for display
  const formatIssueType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Generate complaint ID (stable across re-renders)
  const complaintIdRef = useRef(`VINCA-INS-2026-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`);
  const complaintId = complaintIdRef.current;

  // Get current date for submission timestamp
  const submissionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Persist complaint to localStorage on mount
  useEffect(() => {
    if (form && issueType) {
      const complaint = {
        id: complaintId,
        insurer: form.insurer || '',
        issueType: issueType,
        status: "Registered",
        complaintDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        policyNumber: form.policyNumber || '',
        policyType: form.policyType || '',
        policyHolder: form.policyHolder || '',
        claimNumber: form.claimNumber || '',
        claimAmount: form.claimAmount || '',
        claimStatus: form.claimStatus || '',
        description: form.reasonForClaim || '',
      };
      try {
        const existing = JSON.parse(localStorage.getItem('insurance-complaints') || '[]');
        if (!existing.find((c: any) => c.id === complaint.id)) {
          existing.push(complaint);
          localStorage.setItem('insurance-complaints', JSON.stringify(existing));
        }
      } catch {
        localStorage.setItem('insurance-complaints', JSON.stringify([complaint]));
      }
    }
  }, []);

  const handleCopyComplaintId = () => {
    navigator.clipboard.writeText(complaintId);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-background">
      <CanonicalPageHeader title="Complaint Submitted Successfully!" />
      {/* Main Content */}
      <div className="w-full px-8 py-8">
        {/* Complaint ID Banner */}
        <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">Complaint ID</div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-bold text-primary">{complaintId}</span>
                <button
                  onClick={handleCopyComplaintId}
                  className="p-1.5 hover:bg-primary/10 rounded-md transition group"
                  title="Copy Complaint ID"
                >
                  <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Submitted on {submissionDate}</span>
              </div>
              <button
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition"
                onClick={() => navigate(`/dashboard/insurance`)}
              >
                Track This Complaint
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Grid - Full Width 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Issue Type Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Issue Type</h3>
            </div>
            <p className="text-xl font-medium text-foreground">{formatIssueType(issueType)}</p>
          </div>

          {/* Insurance Company Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Insurance Company</h3>
            </div>
            <p className="text-xl font-medium text-foreground">{form?.insurer}</p>
          </div>

          {/* Documents Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ListChecks className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Documents</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                Policy: {form?.policyDocument ? 1 : 0}
              </span>
              <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                Supporting: {form?.supportingDocuments?.length || form?.files?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Policy Details Section - Full Width */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Hash className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Policy Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Policy Number</div>
              <div className="text-lg font-medium text-foreground">{form?.policyNumber}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Policy Type</div>
              <div className="text-lg font-medium text-foreground">{form?.policyType}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Policy Holder</div>
              <div className="text-lg font-medium text-foreground">{form?.policyHolder}</div>
            </div>
          </div>
        </div>

        {/* Claim Information Section - Full Width (if available) */}
        {(form?.claimNumber || form?.claimAmount || form?.claimStatus) && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <IndianRupee className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Claim Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {form?.claimNumber && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Claim Number</div>
                  <div className="text-lg font-medium text-foreground">{form.claimNumber}</div>
                </div>
              )}
              {form?.claimAmount && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Claim Amount</div>
                  <div className="text-lg font-medium text-foreground">
                    ₹{Number(form.claimAmount).toLocaleString('en-IN')}
                  </div>
                </div>
              )}
              {form?.claimStatus && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Claim Status</div>
                  <div className="text-lg font-medium text-foreground">{form.claimStatus}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description Section - Full Width */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Complaint Description</h3>
          </div>
          <div className="bg-muted/50 rounded-lg p-5">
            <p className="text-foreground text-base leading-relaxed">
              {form?.reasonForClaim || form?.description}
            </p>
          </div>
        </div>

        {/* Action Buttons - Full Width with Centered Content */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center border-t border-border pt-8">
          <button
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition shadow-sm min-w-[200px]"
            onClick={() => navigate("/dashboard/insurance")}
          >
            Track This Complaint
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Next Steps Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            You will receive email updates about your complaint. Our team typically responds within 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;