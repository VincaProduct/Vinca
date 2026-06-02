import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield, Heart, AlertTriangle, CheckCircle, Clock, FileText,
  ArrowRight, ChevronDown, ChevronUp, Phone, FileUp, Gavel,
  Users, Mail, BookOpen, Award, Tag, Calendar, Activity,
  Building2, Pencil, CheckCircle2, XCircle, Hourglass,
  LucideIcon,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Timeline config ───────────────────────────────────────────────────────────

const timelineSteps: TimelineStep[] = [
  { key: 'resolution',        title: 'Final Resolution',                          icon: Award,     description: 'Case resolved in your favour',                                    completedDate: null,         expectedDate: '2026-03-30' },
  { key: 'ombudsman',         title: 'Escalation to Insurance Ombudsman',          icon: Gavel,     description: 'Case escalated for independent review (if required)',              completedDate: null,         expectedDate: '2026-03-22' },
  { key: 'dispute-raised',    title: 'Dispute Raised with Insurance Company',      icon: Mail,      description: 'Formal dispute raised with the insurer',                          completedDate: '2026-03-10', expectedDate: '2026-03-18' },
  { key: 'samadhan-review',   title: 'Case Review by Grievance Partner',           icon: BookOpen,  description: 'Insurance experts reviewing your case',                           completedDate: '2026-03-10', expectedDate: '2026-03-15' },
  { key: 'documents-forwarded',title: 'Documents Forwarded to Grievance Partner', icon: FileUp,    description: 'Your case documents are being shared with our grievance partner',  completedDate: '2026-03-10', expectedDate: '2026-03-12' },
  { key: 'verification-call', title: 'Client Verification Call',                   icon: Phone,     description: "We'll call you to verify the case details",                       completedDate: '2026-03-10', expectedDate: '2026-03-10' },
  { key: 'vinca-review',      title: 'Case Review by Vinca Team',                  icon: Users,     description: 'Our team is reviewing your complaint details',                     completedDate: '2026-03-09', expectedDate: null },
  { key: 'registered',        title: 'Complaint Registered',                       icon: FileText,  description: 'Your complaint has been registered in our system',                 completedDate: '2026-03-08', expectedDate: null },
];

const statusMap: Record<string, string[]> = {
  'Registered':             ['registered'],
  'Under Review':           ['registered', 'vinca-review'],
  'Dispute Filed':          ['registered', 'vinca-review', 'verification-call', 'documents-forwarded', 'samadhan-review', 'dispute-raised'],
  'Ombudsman Escalation':   ['registered', 'vinca-review', 'verification-call', 'documents-forwarded', 'samadhan-review', 'dispute-raised', 'ombudsman'],
  'Resolved':               ['registered', 'vinca-review', 'verification-call', 'documents-forwarded', 'samadhan-review', 'dispute-raised', 'ombudsman', 'resolution'],
  'Closed':                 ['registered', 'vinca-review', 'verification-call', 'documents-forwarded', 'samadhan-review', 'dispute-raised', 'ombudsman', 'resolution'],
};

const statusColors: Record<string, string> = {
  'Registered':           'bg-green-100 text-green-700 border-green-200',
  'Under Review':         'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Awaiting Documents':   'bg-amber-100 text-amber-700 border-amber-200',
  'Dispute Filed':        'bg-orange-100 text-orange-700 border-orange-200',
  'Ombudsman Escalation': 'bg-purple-100 text-purple-700 border-purple-200',
  'Resolved':             'bg-teal-100 text-teal-700 border-teal-200',
  'Closed':               'bg-slate-100 text-slate-600 border-slate-200',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStepStatus(complaint: Complaint | null, stepKey: string): 'completed' | 'active' | 'pending' {
  if (!complaint) return 'pending';
  const completed = statusMap[complaint.status] || ['registered'];
  if (completed.includes(stepKey)) return 'completed';
  if (stepKey === completed[completed.length - 1]) return 'active';
  return 'pending';
}

function fmtDate(d: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-emerald-50 p-2 rounded-lg flex-shrink-0">{icon}</div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-sm font-semibold text-slate-900 break-words">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TimelineRow({ step, status, isLast }: { step: TimelineStep; status: 'completed' | 'active' | 'pending'; isLast: boolean }) {
  const Icon = step.icon;
  const styles = {
    completed: { ring: 'bg-emerald-100 border-emerald-400', icon: 'text-emerald-600', text: 'text-slate-900', line: 'bg-emerald-300' },
    active:    { ring: 'bg-emerald-200 border-emerald-500', icon: 'text-emerald-700', text: 'text-slate-900 font-medium', line: 'bg-emerald-400' },
    pending:   { ring: 'bg-slate-100 border-slate-200',     icon: 'text-slate-400',   text: 'text-slate-400', line: 'bg-slate-200' },
  }[status];

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full ${styles.ring} border-2 flex items-center justify-center flex-shrink-0 z-10`}>
          <Icon className={`w-4 h-4 ${styles.icon}`} />
        </div>
        {!isLast && <div className={`w-0.5 flex-1 min-h-6 ${styles.line} mt-1`} />}
      </div>
      <div className="flex-1 pb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm ${styles.text}`}>{step.title}</p>
          {status === 'active' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">In Progress</span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
        {step.completedDate && status === 'completed' && (
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Completed {fmtDate(step.completedDate)}
          </p>
        )}
        {step.expectedDate && status !== 'completed' && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Hourglass className="w-3 h-3" /> Expected {fmtDate(step.expectedDate)}
          </p>
        )}
      </div>
    </div>
  );
}

function ComplaintTracker({ complaint }: { complaint: Complaint | null }) {
  const [expanded, setExpanded]       = useState(false);
  const [editing, setEditing]         = useState(false);
  const [editId, setEditId]           = useState(complaint?.id || '');
  const [searchError, setSearchError] = useState('');
  const [current, setCurrent]         = useState<Complaint | null>(complaint);

  // Mock lookup — replace with Supabase query when table is live
  const mockComplaints: Complaint[] = [
    { id: 'VINCA-INS-2026-0001', company: 'HDFC Life',        issueType: 'Claim Rejected',           status: 'Registered',  lastUpdated: '2026-03-05', complaintDate: '2026-03-05' },
    { id: 'VINCA-INS-2026-0002', company: 'ICICI Prudential', issueType: 'Claim Delay',              status: 'Under Review', lastUpdated: '2026-03-06', complaintDate: '2026-03-06' },
    { id: 'VINCA-INS-2026-0003', company: 'Max Bupa',         issueType: 'Policy Issue',             status: 'Resolved',    lastUpdated: '2026-03-07', complaintDate: '2026-03-07' },
    { id: 'VINCA-INS-2026-0004', company: 'Tata AIG',         issueType: 'Claim Partially Settled',  status: 'Dispute Filed',lastUpdated: '2026-03-08', complaintDate: '2026-03-08' },
  ];

  function handleSave() {
    const found = mockComplaints.find(c => c.id === editId);
    if (found) { setCurrent(found); setEditing(false); setSearchError(''); }
    else { setSearchError('Complaint ID not found'); setCurrent(null); }
  }

  const stepsDesc = [...timelineSteps].reverse();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between gap-4 p-6 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 p-2.5 rounded-xl">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Track Your Complaint</p>
            {current ? (
              <div className="flex items-center gap-2 mt-0.5">
                {editing ? (
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={editId}
                      onChange={e => { setEditId(e.target.value); setSearchError(''); }}
                      onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
                      className="font-mono text-xs border border-emerald-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="VINCA-INS-2026-XXXX"
                    />
                    <button onClick={handleSave}><CheckCircle2 className="w-4 h-4 text-emerald-600" /></button>
                    <button onClick={() => setEditing(false)}><XCircle className="w-4 h-4 text-red-500" /></button>
                  </div>
                ) : (
                  <>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{current.id}</span>
                    <button onClick={e => { e.stopPropagation(); setEditing(true); }} className="text-slate-400 hover:text-emerald-600 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[current.status] || statusColors['Registered']}`}>
                      {current.status}
                    </span>
                  </>
                )}
                {searchError && <span className="text-xs text-red-500">{searchError}</span>}
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-0.5">Enter your complaint ID to track progress</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 flex-shrink-0">
          {expanded ? 'Hide' : 'View'}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded timeline */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-100">
          {current ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 mb-6">
                <InfoCard icon={<Tag className="w-4 h-4 text-emerald-600" />}      label="Complaint ID"   value={current.id} />
                <InfoCard icon={<Calendar className="w-4 h-4 text-emerald-600" />} label="Filed on"       value={fmtDate(current.complaintDate)} />
                <InfoCard icon={<Activity className="w-4 h-4 text-emerald-600" />} label="Issue"          value={current.issueType} />
                <InfoCard icon={<Building2 className="w-4 h-4 text-emerald-600" />}label="Insurer"        value={current.company} />
              </div>
              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm font-semibold text-slate-700 mb-4">Complaint Progress</p>
                {stepsDesc.map((step, i) => (
                  <TimelineRow
                    key={step.key}
                    step={step}
                    status={getStepStatus(current, step.key)}
                    isLast={i === stepsDesc.length - 1}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="mt-5 text-center py-8">
              <p className="text-sm text-slate-500 mb-3">No complaint found. Enter your Complaint ID above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Complaint registration form ───────────────────────────────────────────────

const INSURERS = ['HDFC Life', 'ICICI Prudential', 'Max Life', 'SBI Life', 'LIC', 'Tata AIA', 'Bajaj Allianz Life',
  'Star Health', 'Niva Bupa', 'Care Health', 'HDFC Ergo Health', 'Aditya Birla Health', 'Other'];

const ISSUE_TYPES = ['Claim Rejected', 'Claim Delayed', 'Claim Partially Settled', 'Policy Lapsed Dispute', 'Other'];

function ComplaintForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', insurer: '', policyType: 'life', issueType: '', policyNumber: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.insurer || !form.issueType || !form.description) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { error: dbError } = await (supabase.from as any)('insurance_complaints').insert({
        name:          form.name,
        email:         form.email,
        phone:         form.phone,
        insurer:       form.insurer,
        policy_type:   form.policyType,
        issue_type:    form.issueType,
        policy_number: form.policyNumber || null,
        description:   form.description,
        status:        'Registered',
      });
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us at support@vincawealth.com');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-3">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-emerald-600" />
        </div>
        <p className="text-lg font-bold text-slate-900">Complaint registered</p>
        <p className="text-sm text-slate-600 max-w-sm mx-auto">
          Our team will review your case and call you within 2 business days. You'll receive a Complaint ID via email to track progress.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
      <p className="font-semibold text-slate-900">Tell us about your claim issue</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone *</label>
          <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit mobile"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Insurer *</label>
          <select value={form.insurer} onChange={e => set('insurer', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
            <option value="">Select insurer</option>
            {INSURERS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy type *</label>
          <select value={form.policyType} onChange={e => set('policyType', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
            <option value="life">Life Insurance</option>
            <option value="health">Health Insurance</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue type *</label>
          <select value={form.issueType} onChange={e => set('issueType', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
            <option value="">Select issue</option>
            {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy number <span className="font-normal text-slate-400">(optional)</span></label>
        <input value={form.policyNumber} onChange={e => set('policyNumber', e.target.value)} placeholder="e.g. HDFC12345678"
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">What happened? *</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4}
          placeholder="Describe the claim issue — what was claimed, when it was rejected or delayed, and what the insurer told you..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting}
        className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition disabled:opacity-50">
        {submitting ? 'Submitting...' : 'Register my complaint →'}
      </button>

      <p className="text-xs text-slate-400 text-center">
        Our team reviews every complaint within 2 business days. You pay nothing unless we recover your claim.
      </p>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  { step: '01', icon: FileText, title: 'Register your complaint', desc: 'Tell us what happened — claim rejected, delayed, or partially settled. Takes 5 minutes.' },
  { step: '02', icon: Users,    title: 'Vinca reviews your case', desc: 'Our team assesses the merits and calls you within 2 business days. No charge at this stage.' },
  { step: '03', icon: Gavel,    title: 'We raise the grievance',  desc: 'Formal dispute with the insurer. If needed, we escalate to the Insurance Ombudsman.' },
  { step: '04', icon: Award,    title: 'You pay only if we win',  desc: 'Our fee is charged only when the claim is recovered. If we lose, you owe us nothing.' },
];

export default function InsurancePage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <CanonicalPageHeader
        title="The protection layer your retirement plan can't survive without."
      />

      <div className="py-12 px-6 lg:px-8 space-y-16 max-w-4xl mx-auto">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl overflow-hidden" style={{ background: '#0D2818' }}>
          <div className="p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <p className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Retirement Protection</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight" style={{ letterSpacing: '-0.02em' }}>
              We fight for your claim.<br />
              <span className="text-emerald-400">You pay only if we win.</span>
            </h1>
            <p className="text-base text-white/60 max-w-xl leading-relaxed">
              A single rejected insurance claim can undo years of retirement savings. Vinca's claim support team fights rejected and delayed claims — through formal grievance and Insurance Ombudsman escalation — at zero upfront cost to you.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => { setShowForm(true); document.getElementById('claim-support')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition"
              >
                I need help with a claim →
              </button>
              <button
                onClick={() => navigate('/dashboard/compass')}
                className="px-6 py-3 rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 text-sm font-semibold transition"
              >
                I want to buy insurance
              </button>
            </div>
          </div>
        </section>

        {/* ── The Stakes ───────────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">Why this matters for retirement</p>
            <h2 className="text-2xl font-bold text-slate-900">One bad event can collapse your retirement plan</h2>
            <p className="text-sm text-slate-500 mt-1">Insurance isn't separate from your retirement plan — it's the safety net underneath it.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <Shield className="w-5 h-5 text-red-500" />,
                bg: 'bg-red-50 border-red-200',
                title: 'No term cover during accumulation',
                body: 'You die at 42. SIPs stop. Family loses the income that was building the corpus. Retirement plan for your spouse: gone.',
              },
              {
                icon: <Heart className="w-5 h-5 text-orange-500" />,
                bg: 'bg-orange-50 border-orange-200',
                title: 'Major illness without health cover',
                body: 'Cancer treatment at 48 costs ₹25–50L. That\'s 3–5 years of SIPs wiped out in one hospitalisation. Retirement delayed by a decade.',
              },
              {
                icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
                bg: 'bg-amber-50 border-amber-200',
                title: 'Inadequate cover in retirement',
                body: 'Medical inflation runs at 14% p.a. ₹5L cover bought in 2010 covers almost nothing in 2035. Your corpus becomes your insurer.',
              },
            ].map((card, i) => (
              <div key={i} className={`rounded-2xl border p-5 space-y-3 ${card.bg}`}>
                <div className="bg-white rounded-lg w-9 h-9 flex items-center justify-center shadow-sm">{card.icon}</div>
                <p className="font-semibold text-slate-900 text-sm leading-snug">{card.title}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>Your FFR score includes Essentials Coverage (20 points)</strong> — which checks whether you have adequate life and health insurance in place.
              A score of 0/20 here is the single biggest gap most investors have.{' '}
              <button onClick={() => navigate('/dashboard/ffr')} className="text-emerald-700 font-semibold hover:underline">
                Check your Essentials Coverage score →
              </button>
            </p>
          </div>
        </section>

        {/* ── What you need ────────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">Pure protection only</p>
            <h2 className="text-2xl font-bold text-slate-900">Two products. That's all you need.</h2>
            <p className="text-sm text-slate-500 mt-1">
              We only recommend pure protection products — term and health. No ULIPs, no endowments, no money-back plans.
              <span className="text-slate-700 font-medium"> If a policy mixes insurance with investment, it's bad at both.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Term Insurance */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Pillar 1</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">Term Life Insurance</p>
                <p className="text-sm text-slate-500 mt-1">Pure death cover. Pays your family if you die during the corpus-building years.</p>
              </div>
              <div className="space-y-2">
                {[
                  'Cover = 10–15× annual income',
                  'Duration = till corpus is built (age 55–60)',
                  '₹1 Cr cover costs ~₹8,000–12,000/year',
                  'No surrender value — and that\'s correct',
                ].map(pt => (
                  <div key={pt} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {pt}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/dashboard/compass')}
                className="w-full py-2.5 rounded-lg border-2 border-emerald-600 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition flex items-center justify-center gap-2">
                Get guidance <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Health Insurance */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="bg-rose-50 p-3 rounded-xl">
                  <Heart className="w-6 h-6 text-rose-500" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">Pillar 2</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">Health Insurance</p>
                <p className="text-sm text-slate-500 mt-1">Protects your corpus from medical bills — both during accumulation and throughout retirement.</p>
              </div>
              <div className="space-y-2">
                {[
                  'Family floater: ₹10–20L base cover minimum',
                  'Super top-up: ₹50–100L additional cover',
                  'Buy before 35 — premiums spike with age',
                  'Never let it lapse — reinstatement is hard',
                ].map(pt => (
                  <div key={pt} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {pt}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/dashboard/compass')}
                className="w-full py-2.5 rounded-lg border-2 border-emerald-600 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition flex items-center justify-center gap-2">
                Get guidance <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Insurance distributed via eBix POSP (personal license). Vinca does not hold a corporate insurance license.
            All guidance is educational — we connect you with the right products, not push commissions.
          </p>
        </section>

        {/* ── Claim Support ────────────────────────────────────────────────── */}
        <section id="claim-support" className="space-y-8">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">Claim Support</p>
            <h2 className="text-2xl font-bold text-slate-900">Your insurance only works if the claim gets paid</h2>
            <p className="text-sm text-slate-500 mt-1">
              Indian insurers reject or delay a significant portion of claims. Vinca fights for you — through formal grievance and Insurance Ombudsman — at zero upfront cost.
            </p>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-100">{s.step}</span>
                    <div className="bg-emerald-50 p-2 rounded-lg">
                      <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm leading-snug">{s.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>

          {/* USP banner */}
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ background: '#0D2818' }}>
            <div className="bg-emerald-500/20 p-3 rounded-xl flex-shrink-0">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">No recovery, no fee — guaranteed</p>
              <p className="text-sm text-white/60 mt-0.5">
                Our success fee is charged only when your claim is recovered. If we cannot get you the money, you owe us nothing. This aligns our interests completely with yours.
              </p>
            </div>
          </div>

          {/* Form or trigger */}
          {showForm ? (
            <ComplaintForm />
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Has your claim been rejected or delayed?</p>
                <p className="text-sm text-slate-500 mt-1">Register your complaint and our team will review it within 2 business days.</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition"
              >
                Register a complaint →
              </button>
            </div>
          )}

          {/* Tracker */}
          <ComplaintTracker complaint={null} />
        </section>

        {/* ── Disclaimer ───────────────────────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <p className="text-sm text-blue-900 leading-relaxed">
            <strong>Educational content only:</strong> Insurance product information on this page is for general awareness. Premium figures are indicative.
            Vinca does not hold a corporate insurance broking license — distribution is via eBix POSP (personal license).
            Claim support is provided through our grievance assistance service and is not a legal guarantee of claim recovery.
          </p>
        </div>

      </div>
    </>
  );
}
