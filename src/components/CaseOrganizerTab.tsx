import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  HelpCircle,
  FileCheck2,
  Users,
  AlertTriangle,
  Loader2,
  Printer,
  Copy,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { Jurisdiction, CaseOrganizationResult } from '../types/legal';
import { SAMPLE_DOCUMENTS } from '../utils/preloadedData';
import { sanitizeLegalText } from '../utils/redact';

interface CaseOrganizerTabProps {
  jurisdiction: Jurisdiction;
}

export const CaseOrganizerTab: React.FC<CaseOrganizerTabProps> = ({ jurisdiction }) => {
  const [narrative, setNarrative] = useState('');
  const [docsList, setDocsList] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CaseOrganizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<'timeline' | 'issues' | 'parties' | 'evidence' | 'lawyerPacket'>('timeline');

  const handleLoadSample = () => {
    setNarrative(SAMPLE_DOCUMENTS.consumerDispute);
    setDocsList('1. Invoice #INV-1204 dated 12 Aug 2026\n2. Service center acknowledgment slip dated 5 Sept 2026\n3. Warranty denial email dated 18 Sept 2026\n4. Follow-up emails to grievance officer');
  };

  const handleOrganize = async () => {
    if (!narrative.trim()) {
      setError('Please provide the facts or chronological notes of the case.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        caseNarrative: narrative,
        documentsList: docsList,
        jurisdiction,
      };

      const res = await fetch('/api/legal/organize-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to organize case.');
      }

      const data: CaseOrganizationResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Error occurred while organizing case.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPacket = () => {
    if (!result) return;

    let text = `LEGAL CONSULTATION BRIEFING PACKET\nJurisdiction: ${jurisdiction.country}\n\n`;
    text += `CASE SUMMARY:\n${result.caseSummary}\n\n`;
    text += `CRITICAL TIMELINE:\n`;
    result.timeline.forEach((t) => {
      text += `- [${t.date}] ${t.event} (Significance: ${t.significance})\n`;
    });
    text += `\nCORE LEGAL ISSUES:\n`;
    result.issues.forEach((i) => {
      text += `- ${i.id}: ${i.title} (${i.relevantLegalArea}) - ${i.question}\n`;
    });
    text += `\nEVIDENCE STATUS:\n`;
    result.evidenceMatrix.forEach((e) => {
      text += `- [${e.status.toUpperCase()}] ${e.item} (${e.importance} priority): ${e.purpose}\n`;
    });
    text += `\nQUESTIONS FOR LAWYER:\n`;
    result.questionsForLawyer.forEach((q, idx) => {
      text += `Q${idx + 1} [${q.category}]: ${q.question}\n   Reason: ${q.rationale}\n`;
    });

    navigator.clipboard.writeText(text);
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
              Case & Timeline Organizer
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Transforms disorganized notes into chronological event timelines, issue lists, evidence matrices & lawyer consultation packets.
            </p>
          </div>

          <button
            onClick={handleLoadSample}
            className="text-xs font-medium px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md border border-stone-200 transition-colors"
          >
            Load Sample Consumer Case
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Case Narrative / Fact Dump
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (narrative) {
                      const res = sanitizeLegalText(narrative);
                      setNarrative(res.cleanedText);
                    }
                  }}
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" /> Scrub PII
                </button>
              </div>
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Paste the story, emails, dates, notes, or dispute events in any order..."
                rows={10}
                className="w-full text-xs p-3 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                List of Known Invoices / Documents (Optional)
              </label>
              <textarea
                value={docsList}
                onChange={(e) => setDocsList(e.target.value)}
                placeholder="e.g. 1. WhatsApp chat screenshots 2. Bank transfer receipt 3. Termination letter"
                rows={3}
                className="w-full text-xs p-2.5 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleOrganize}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Timeline & Evidence Matrix...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4 text-amber-300" />
                  <span>Organize Case & Prepare Lawyer Packet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Organized Results Panel */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 legal-heading">
                    Structured Case File & Briefing
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    {result.timeline?.length || 0} Chronological Events · {result.issues?.length || 0} Core Issues
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPacket}
                    className="px-3 py-1.5 bg-white border border-stone-200 text-stone-700 hover:text-stone-900 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied Brief' : 'Copy Brief'}</span>
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

              {/* Summary */}
              <div className="p-4 bg-stone-50 border-b border-stone-200 text-xs text-stone-800 leading-relaxed font-medium">
                {result.caseSummary}
              </div>

              {/* Sub Tabs */}
              <div className="border-b border-stone-200 px-4 py-2 bg-stone-100/60 flex flex-wrap items-center gap-1 text-xs">
                <button
                  onClick={() => setActiveSection('timeline')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    activeSection === 'timeline' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Chronological Timeline
                </button>
                <button
                  onClick={() => setActiveSection('issues')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    activeSection === 'issues' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Legal Issues
                </button>
                <button
                  onClick={() => setActiveSection('parties')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    activeSection === 'parties' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Parties & Exposure
                </button>
                <button
                  onClick={() => setActiveSection('evidence')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    activeSection === 'evidence' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Evidence Matrix
                </button>
                <button
                  onClick={() => setActiveSection('lawyerPacket')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    activeSection === 'lawyerPacket' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Lawyer Consultation Packet
                </button>
              </div>

              {/* View 1: Timeline */}
              {activeSection === 'timeline' && (
                <div className="p-6 space-y-4">
                  <div className="relative border-l-2 border-stone-300 ml-3 space-y-6">
                    {result.timeline?.map((event, idx) => (
                      <div key={idx} className="relative pl-6">
                        {/* Dot indicator */}
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-stone-900 border-2 border-white" />
                        <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5">
                          {/* Unboxed Metadata Header (Zero-Pill Discipline) */}
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <span className="font-bold text-stone-900">{event.date}</span>
                            {event.evidenceRef && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-stone-600 font-medium">Ref: {event.evidenceRef}</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-stone-900">{event.event}</p>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            <strong className="text-stone-700">Legal Significance:</strong> {event.significance}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View 2: Issues */}
              {activeSection === 'issues' && (
                <div className="p-6 space-y-3">
                  {result.issues?.map((issue, idx) => (
                    <div key={idx} className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-900">{issue.id}: {issue.title}</span>
                        <span className="text-[11px] font-semibold text-stone-500">{issue.relevantLegalArea}</span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed font-medium">
                        {issue.question}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* View 3: Parties */}
              {activeSection === 'parties' && (
                <div className="p-6 space-y-3">
                  {result.parties?.map((p, idx) => (
                    <div key={idx} className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 legal-heading">{p.name}</h4>
                        <p className="text-xs text-stone-500 font-medium">{p.role}</p>
                        <p className="text-xs text-stone-700 mt-2 leading-relaxed">
                          {p.positionOrExposure}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View 4: Evidence Matrix */}
              {activeSection === 'evidence' && (
                <div className="p-6 space-y-3">
                  <div className="text-xs text-stone-500 mb-2">
                    Categorizes what documents you have vs what records you still need to obtain before court filings.
                  </div>
                  {result.evidenceMatrix?.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-stone-900">{ev.item}</p>
                        <p className="text-stone-600 text-[11px]">{ev.purpose}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Status (Zero-Pill: Clean unboxed text) */}
                        <span
                          className={`font-bold ${
                            ev.status === 'available'
                              ? 'text-emerald-700'
                              : ev.status === 'needed'
                              ? 'text-amber-800'
                              : 'text-red-700'
                          }`}
                        >
                          {ev.status.toUpperCase()}
                        </span>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span className="text-stone-500 font-medium capitalize">
                          {ev.importance} Priority
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View 5: Lawyer Consultation Packet */}
              {activeSection === 'lawyerPacket' && (
                <div className="p-6 space-y-4">
                  <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200">
                    <h4 className="font-bold text-amber-900 text-xs mb-1 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-amber-700" /> Lawyer Consultation Packet
                    </h4>
                    <p className="text-xs text-stone-600 mb-3">
                      Review these high-impact questions with your advocate or solicitor during your meeting.
                    </p>
                    <div className="space-y-3">
                      {result.questionsForLawyer?.map((q, idx) => (
                        <div key={idx} className="p-3 bg-white rounded border border-amber-200/80 text-xs space-y-1">
                          <div className="flex items-center justify-between text-stone-500">
                            <span className="font-semibold text-amber-800">{q.category}</span>
                            <span>Question #{idx + 1}</span>
                          </div>
                          <p className="font-bold text-stone-900">{q.question}</p>
                          <p className="text-stone-600 text-[11px]">
                            <strong className="text-stone-700">Why ask this:</strong> {q.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-stone-800 legal-heading">
                Organize Case Notes & Evidence Chronology
              </h3>
              <p className="text-xs text-stone-500 max-w-md mt-1.5 leading-relaxed">
                Paste facts or click "Load Sample Consumer Case". LegalEase: AI will extract the chronological event timeline, identify legal issues, and prepare a lawyer consultation packet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
