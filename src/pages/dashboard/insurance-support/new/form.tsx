import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CanonicalPageHeader from "@/components/ui/CanonicalPageHeader";
import { Shield, FileUp, AlertCircle } from "lucide-react";

const insurers = [
  "HDFC Life",
  "ICICI Prudential Life",
  "Care Health Insurance",
  "Niva Bupa",
  "Axis Max Life",
  "Tata AIG",
  "Bajaj Allianz",
  "Star Health",
  "Aditya Birla Health",
  "Reliance Nippon Life",
  "SBI Life",
  "Future Generali",
  "Other"
];

const policyTypes = ["Health", "Life", "Motor", "Travel", "Other"];
const claimStatuses = ["Pending", "Rejected", "Partially Paid", "Paid", "Delay"];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const issueTypeToStatusMap: Record<string, string> = {
  "claim-rejected": "Rejected",
  "claim-partially-settled": "Partially Paid",
  "claim-delay": "Delay",
  "policy-issue": "Pending",
  "other": ""
};

const ComplaintFormPage: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const issueType = query.get("type") || "";

  const defaultStatus = issueTypeToStatusMap[issueType] || "";

  const [form, setForm] = useState({
    insurer: "",
    policyNumber: "",
    policyType: "",
    policyHolder: "",
    policyDocument: null as File | null,
    claimNumber: "",
    claimDate: "",
    claimAmount: "",
    claimStatus: defaultStatus,
    rejectionDate: "",
    reasonForClaim: "",
    supportingDocuments: [] as File[],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePolicyDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      setUploadProgress(0);
      setTimeout(() => {
        setForm({ ...form, policyDocument: e.target.files![0] });
        setUploading(false);
        setUploadProgress(100);
      }, 1200);
    }
  };

  const handleSupportingDocumentsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploading(true);
      setUploadProgress(0);
      setTimeout(() => {
        setForm({ ...form, supportingDocuments: Array.from(e.target.files!) });
        setUploading(false);
        setUploadProgress(100);
      }, 1200);
    }
  };

  const handleRemovePolicyDocument = () => {
    setForm({ ...form, policyDocument: null });
  };

  const handleRemoveSupportingDocument = (idx: number) => {
    setForm({
      ...form,
      supportingDocuments: form.supportingDocuments.filter((_, i) => i !== idx)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.insurer || !form.policyNumber || !form.policyType || !form.policyHolder || !form.reasonForClaim || form.reasonForClaim.length < 20) {
      setError("Please fill all required fields and provide a detailed reason for claim (min 20 characters).");
      return;
    }
    setError("");
    setTimeout(() => {
      navigate("/dashboard/insurance-support/new/success", { state: { form, issueType } });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <CanonicalPageHeader title="Register Insurance Complaint" />
      
      {/* Subtle Background Accent - Full Width */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <div className="w-full bg-primary/5 border border-primary/20 rounded-lg px-5 py-3">
          <p className="text-muted-foreground text-sm">
            Submit your complaint and supporting documents. Our team will review the case and guide you through the dispute resolution process.
          </p>
        </div>
      </div>

      {/* Form Container - Full Width with Proper Padding */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Section 1: Policy Information */}
          <div className="w-full bg-card border border-primary/20 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Policy Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Insurance Company <span className="text-destructive">*</span>
                </label>
                <select
                  name="insurer"
                  value={form.insurer}
                  onChange={handleInput}
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="">Select insurer</option>
                  {insurers.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Policy Number <span className="text-destructive">*</span>
                </label>
                <input
                  name="policyNumber"
                  value={form.policyNumber}
                  onChange={handleInput}
                  required
                  placeholder="Enter policy number"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Policy Holder Name <span className="text-destructive">*</span>
                </label>
                <input
                  name="policyHolder"
                  value={form.policyHolder}
                  onChange={handleInput}
                  required
                  placeholder="Full name as on policy"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Policy Type <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-wrap gap-3 pt-1">
                  {policyTypes.map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm bg-muted px-3 py-1.5 rounded-md border border-border hover:border-primary transition cursor-pointer">
                      <input
                        type="radio"
                        name="policyType"
                        value={type}
                        checked={form.policyType === type}
                        onChange={handleInput}
                        required
                        className="text-primary focus:ring-primary"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Policy Document Upload */}
            <div className="mt-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Upload Policy Document
              </label>
              <div className="border border-dashed border-primary/30 rounded-lg p-4 bg-muted/30">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handlePolicyDocumentUpload}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your insurance policy document (PDF or image)
                </p>
              </div>
              
              {uploading && (
                <div className="mt-2 text-primary text-sm">
                  Uploading... {uploadProgress}%
                </div>
              )}
              
              {form.policyDocument && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-sm border border-primary/20">
                    <span>{form.policyDocument.name}</span>
                    <span className="text-primary/70 text-xs">
                      ({Math.round(form.policyDocument.size / 1024)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={handleRemovePolicyDocument}
                      className="text-destructive hover:text-destructive/80 ml-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Claim Information */}
          <div className="w-full bg-card border border-primary/20 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <FileUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Claim Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Claim Number</label>
                <input
                  name="claimNumber"
                  value={form.claimNumber}
                  onChange={handleInput}
                  placeholder="Enter claim number (if filed)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Claim Filed Date</label>
                <input
                  name="claimDate"
                  type="date"
                  value={form.claimDate}
                  onChange={handleInput}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Claim Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <input
                    name="claimAmount"
                    type="number"
                    value={form.claimAmount}
                    onChange={handleInput}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Current Claim Status</label>
                <select
                  name="claimStatus"
                  value={form.claimStatus}
                  onChange={handleInput}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="">Select status</option>
                  {claimStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {form.claimStatus === "Rejected" && (
              <div className="mt-4">
                <label className="text-sm font-medium text-foreground mb-2 block">Rejection Date</label>
                <input
                  name="rejectionDate"
                  type="date"
                  value={form.rejectionDate}
                  onChange={handleInput}
                  className="w-full md:w-1/2 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
            )}
          </div>

          {/* Section 3: Complaint Details */}
          <div className="w-full bg-card border border-primary/20 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Complaint Details
              </h3>
            </div>

            {/* Reason for Claim */}
            <div className="space-y-1.5 mb-6">
              <label className="text-sm font-medium text-foreground">
                Describe the incident <span className="text-destructive">*</span>
              </label>
              <textarea
                name="reasonForClaim"
                value={form.reasonForClaim}
                onChange={handleInput}
                required
                minLength={20}
                maxLength={2000}
                rows={4}
                placeholder="Describe the incident that led to this claim. For example: flight delay, hospitalization, accident, etc."
                className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
              <p className="text-xs text-muted-foreground">
                {form.reasonForClaim.length}/2000 characters · Explain what happened and why you filed the claim.
              </p>
            </div>

            {/* Supporting Documents */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Upload Supporting Documents
              </label>
              <div className="border border-dashed border-primary/30 rounded-lg p-4 bg-muted/30">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleSupportingDocumentsUpload}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload proof related to your claim (tickets, medical bills, receipts, emails etc.)
                </p>
              </div>
              
              {uploading && (
                <div className="text-primary text-sm">
                  Uploading... {uploadProgress}%
                </div>
              )}
              
              {form.supportingDocuments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.supportingDocuments.map((file, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-sm border border-primary/20"
                    >
                      <span>{file.name}</span>
                      <span className="text-primary/70 text-xs">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSupportingDocument(idx)}
                        className="text-destructive hover:text-destructive/80 ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="w-full flex justify-end gap-4 pt-4 border-t border-border mt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/insurance-support/new/type")}
              className="px-5 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition shadow-sm"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintFormPage;