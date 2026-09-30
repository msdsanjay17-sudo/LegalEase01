import React, { useState } from 'react';
import {
  FileEdit,
  Send,
  Loader2,
  Copy,
  Printer,
  CheckSquare,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Download,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { Jurisdiction, DraftResult } from '../types/legal';
import { sanitizeLegalText } from '../utils/redact';

interface LegalDraftingTabProps {
  jurisdiction: Jurisdiction;
}

const DRAFT_TEMPLATES = [
  { id: 'Legal Notice - Recovery of Dues', label: 'Legal Notice: Recovery of Dues / Unpaid Invoices' },
  { id: 'Legal Notice - Defective Goods & Consumer Redressal', label: 'Legal Notice: Defective Goods / Deficient Service' },
  { id: 'Legal Notice - Tenant Deposit Refund', label: 'Legal Notice: Landlord Refund of Security Deposit' },
  { id: 'Tenancy Vacation Notice', label: 'Tenancy Notice: Notice to Vacate Premises' },
  { id: 'Cease & Desist - Defamation or Infringement', label: 'Cease & Desist: Unauthorized Use / Defamatory Remarks' },
  { id: 'Consumer Forum Formal Complaint', label: 'Consumer Complaint Petition (Consumer Forum / Commission)' },
  { id: 'RTI Application', label: 'RTI (Right to Information) Application' },
  { id: 'Formal Response to Legal Notice', label: 'Reply / Response to a Received Legal Notice' },
  { id: 'Simple Independent Contractor Agreement', label: 'Simple Independent Contractor Agreement' },
];

export const LegalDraftingTab: React.FC<LegalDraftingTabProps> = ({ jurisdiction }) => {
  const [draftType, setDraftType] = useState('Legal Notice - Recovery of Dues');
  const [senderInfo, setSenderInfo] = useState('');
  const [recipientInfo, setRecipientInfo] = useState('');
  const [matterDescription, setMatterDescription] = useState('');
  const [keyDemands, setKeyDemands] = useState('');
  const [datesTimeline, setDatesTimeline] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DraftResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Editable drafted content state
  const [editableDoc, setEditableDoc] = useState('');

  const handleApplyPreset = (id: string) => {
    setDraftType(id);
    if (id === 'Legal Notice - Recovery of Dues') {
      setMatterDescription('Completed contract software development work per invoice #INV-402 for ₹1,45,000 delivered on 15 July 2026. Recipient accepted delivery but failed to clear invoice despite multiple reminders.');
      setKeyDemands('Immediate release of outstanding amount of ₹1,45,000 along with interest @ 18% p.a. from due date within 15 days of receipt of notice.');
      setDatesTimeline('Work delivered: 15 July 2026. Payment due: 30 July 2026. Follow-up emails sent: 10 Aug, 25 Aug, 10 Sept 2026.');
    } else if (id === 'Legal Notice - Tenant Deposit Refund') {
      setMatterDescription('Vacated Flat 301, Silver Heights on 31 August 2026 upon tenancy completion. Handed over vacant peaceful possession with no property damage. Landlord acknowledged handover but is withholding security deposit of ₹1,20,000 without lawful justification.');
      setKeyDemands('Full refund of security deposit of ₹1,20,000 within 14 days of receipt of notice.');
      setDatesTimeline('Tenancy period: 1 Sept 2025 to 31 Aug 2026. Vacated on: 31 Aug 2026.');
    } else if (id === 'Legal Notice - Defective Goods & Consumer Redressal') {
      setMatterDescription('Purchased Laptop Apex Pro 16 on 12 August 2026 for ₹1,28,000. Motherboard failed within 18 days. Company wrongfully denied 2-year comprehensive on-site warranty citing unsubstantiated liquid damage and withheld laptop.');
      setKeyDemands('Full refund of purchase price ₹1,28,000 or replacement with brand-new unit, plus ₹25,000 for mental agony and professional work loss.');
      setDatesTimeline('Purchase: 12 Aug 2026. Breakdown: 30 Aug 2026. Technician visit: 5 Sept 2026.');
    }
  };

  const handleGenerateDraft = async () => {
    if (!matterDescription.trim()) {
      setError('Please provide the description of the matter.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        draftType,
        jurisdiction,
        senderInfo: senderInfo || '[NAME / DESIGNATION OF SENDER]',
        recipientInfo: recipientInfo || '[NAME / DESIGNATION OF RECIPIENT]',
        matterDescription,
        keyDemandsOrTerms: keyDemands,
        datesAndTimeline: datesTimeline,
      };

      const res = await fetch('/api/legal/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to generate draft.');
      }

      const data: DraftResult = await res.json();
      setResult(data);
      setEditableDoc(data.documentContent);
    } catch (err: any) {
      setError(err?.message || 'Error occurred while drafting.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 legal-heading">
              Legal Drafting Desk
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Section 6 Compliant: Standard bracketed placeholders [NAME], [DATE], no fabricated evidence, clear assumptions declared.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Quick Templates:</span>
            <button
              onClick={() => handleApplyPreset('Legal Notice - Recovery of Dues')}
              className="text-xs font-medium px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-200 transition-colors"
            >
              Unpaid Dues Notice
            </button>
            <button
              onClick={() => handleApplyPreset('Legal Notice - Tenant Deposit Refund')}
              className="text-xs font-medium px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-200 transition-colors"
            >
              Deposit Refund
            </button>
            <button
              onClick={() => handleApplyPreset('Legal Notice - Defective Goods & Consumer Redressal')}
              className="text-xs font-medium px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-200 transition-colors"
            >
              Consumer Notice
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Input Details Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Select Document / Notice Type
              </label>
              <select
                value={draftType}
                onChange={(e) => handleApplyPreset(e.target.value)}
                className="w-full text-xs font-medium p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
              >
                {DRAFT_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Sender / Aggrieved Party
                </label>
                <input
                  type="text"
                  value={senderInfo}
                  onChange={(e) => setSenderInfo(e.target.value)}
                  placeholder="e.g. Rajesh Kumar (or leave for [NAME])"
                  className="w-full text-xs p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Recipient / Opposing Party
                </label>
                <input
                  type="text"
                  value={recipientInfo}
                  onChange={(e) => setRecipientInfo(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                  className="w-full text-xs p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Factual Narrative of the Matter
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const res = sanitizeLegalText(matterDescription);
                    setMatterDescription(res.cleanedText);
                  }}
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" /> Scrub PII
                </button>
              </div>
              <textarea
                value={matterDescription}
                onChange={(e) => setMatterDescription(e.target.value)}
                placeholder="Explain the background truthfully. What was agreed upon? What breach occurred? What communications were sent? Do not fabricate allegations."
                rows={5}
                className="w-full text-xs p-3 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Key Demands / Remedies Sought
              </label>
              <textarea
                value={keyDemands}
                onChange={(e) => setKeyDemands(e.target.value)}
                placeholder="e.g. Refund of ₹50,000 with 18% interest, delivery of possession within 15 days, or formal apology..."
                rows={2}
                className="w-full text-xs p-2.5 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Dates, Chronology & Invoices
              </label>
              <input
                type="text"
                value={datesTimeline}
                onChange={(e) => setDatesTimeline(e.target.value)}
                placeholder="e.g. Invoice dated 15 July 2026, reminder sent 10 August 2026"
                className="w-full text-xs p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerateDraft}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting Document with Placeholders...</span>
                </>
              ) : (
                <>
                  <FileEdit className="w-4 h-4 text-amber-300" />
                  <span>Generate Non-Deceptive Legal Draft</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Draft & Lawyer Review Checklist */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden flex flex-col h-full">
              {/* Draft Toolbar */}
              <div className="p-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 legal-heading">
                    {result.documentTitle}
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    Jurisdiction: {jurisdiction.country} · Section 6 Draft Standard
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-white border border-stone-200 text-stone-700 hover:text-stone-900 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-white border border-stone-200 text-stone-700 hover:text-stone-900 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs no-print"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Editable Document Body */}
              <div className="p-6 flex-1 bg-white">
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-stone-700">
                  <p className="font-semibold text-amber-900 mb-0.5">Placeholder Instructions:</p>
                  <p>
                    Review and replace all bracketed items such as <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">[NAME]</code>, <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">[DATE]</code>, and <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">[ADDRESS]</code> directly in the editor below before presenting to counsel.
                  </p>
                </div>

                <textarea
                  value={editableDoc}
                  onChange={(e) => setEditableDoc(e.target.value)}
                  rows={18}
                  className="w-full text-xs font-legal leading-relaxed p-4 border border-stone-200 rounded-lg bg-stone-50/30 text-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none whitespace-pre-wrap"
                />
              </div>

              {/* Assumptions & Lawyer Checklist Drawer */}
              <div className="border-t border-stone-200 p-5 bg-stone-50/60 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Assumptions Declared */}
                  <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs">
                    <h4 className="font-bold text-stone-900 mb-1 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-stone-500" /> Assumptions Declared
                    </h4>
                    <ul className="space-y-1 text-stone-600">
                      {result.assumptionsMade?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-stone-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pre-Sending Lawyer Checklist */}
                  <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs">
                    <h4 className="font-bold text-stone-900 mb-1 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> Lawyer Review Checklist
                    </h4>
                    <ul className="space-y-1 text-stone-700">
                      {result.recommendedLawyerChecklist?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Service / Delivery Guidance */}
                {result.serviceOrFilingGuidance && (
                  <div className="p-3 bg-stone-100/70 rounded-lg text-xs text-stone-600">
                    <strong className="text-stone-800">Delivery & Service Mode Guidance:</strong>{' '}
                    <span>{result.serviceOrFilingGuidance}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                <FileEdit className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-stone-800 legal-heading">
                Draft Professional Legal Documents & Notices
              </h3>
              <p className="text-xs text-stone-500 max-w-md mt-1.5 leading-relaxed">
                Select a notice template or enter custom facts on the left. LegalEase: AI will format formal legal notices, tenancy complaints, or consumer petitions with standard placeholders.
              </p>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleApplyPreset('Legal Notice - Recovery of Dues')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-md border border-stone-200 transition-colors"
                >
                  Load Dues Notice
                </button>
                <button
                  onClick={() => handleApplyPreset('Legal Notice - Tenant Deposit Refund')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-md border border-stone-200 transition-colors"
                >
                  Load Deposit Notice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
