import React, { useState } from 'react';
import {
  Search,
  Scale,
  FileText,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Send,
  Loader2,
  Copy,
  Printer,
  Sparkles,
  ShieldCheck,
  UploadCloud,
  FileCheck,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Jurisdiction, AudienceLevel, LegalAnalysisResult } from '../types/legal';
import { sanitizeLegalText } from '../utils/redact';
import { SAMPLE_DOCUMENTS } from '../utils/preloadedData';

interface LegalAnalyzerTabProps {
  jurisdiction: Jurisdiction;
  audienceLevel: AudienceLevel;
  language: string;
  onTriggerHighRisk: (risk: { category?: string; warning?: string }) => void;
}

export const LegalAnalyzerTab: React.FC<LegalAnalyzerTabProps> = ({
  jurisdiction,
  audienceLevel,
  language,
  onTriggerHighRisk,
}) => {
  const [query, setQuery] = useState('');
  const [facts, setFacts] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; mimeType: string; base64: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LegalAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'irac' | 'lawyerPrep' | 'sources'>('overview');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      setUploadedFile({
        name: file.name,
        mimeType: file.type || 'text/plain',
        base64: base64String,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRedactField = (field: 'facts' | 'query') => {
    if (field === 'facts' && facts) {
      const res = sanitizeLegalText(facts);
      setFacts(res.cleanedText);
    } else if (field === 'query' && query) {
      const res = sanitizeLegalText(query);
      setQuery(res.cleanedText);
    }
  };

  const loadSample = (sampleKey: keyof typeof SAMPLE_DOCUMENTS) => {
    if (sampleKey === 'consumerDispute') {
      setQuery('Can a manufacturer refuse warranty claim by asserting unproven "liquid damage" and withholding my laptop? What are my statutory remedies under consumer protection laws?');
      setFacts(SAMPLE_DOCUMENTS.consumerDispute);
    } else if (sampleKey === 'leaseAgreement') {
      setQuery('Is a 6-month lock-in penalty legally enforceable if I need to relocate for job reasons? Can the landlord forfeit my full deposit?');
      setFacts(SAMPLE_DOCUMENTS.leaseAgreement);
    }
  };

  const handleAnalyze = async () => {
    if (!query.trim() && !facts.trim() && !uploadedFile) {
      setError('Please provide a legal query or facts to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        query,
        facts,
        jurisdiction,
        audienceLevel,
        language,
      };

      if (uploadedFile) {
        payload.fileData = {
          base64: uploadedFile.base64,
          mimeType: uploadedFile.mimeType,
          name: uploadedFile.name,
        };
      }

      const res = await fetch('/api/legal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to complete legal analysis.');
      }

      const data: LegalAnalysisResult = await res.json();
      setResult(data);

      if (data.highRiskEvaluation?.isHighRisk) {
        onTriggerHighRisk({
          category: data.highRiskEvaluation.riskCategory || 'Urgent Legal Matter',
          warning: data.highRiskEvaluation.urgentWarning || 'High-risk situation identified.',
        });
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!result) return;
    const textToCopy = `LEGAL ANALYSIS SUMMARY
Jurisdiction: ${jurisdiction.country} (${jurisdiction.state || 'General'})
Issue: ${result.issue}

SHORT ANSWER:
${result.shortAnswer}

RELEVANT LAW:
${result.relevantLaw}

FACTS VS ASSUMPTIONS:
Facts: ${result.factsSeparated.userStatedFacts.join(', ')}
Assumptions: ${result.factsSeparated.assumptionsOrInferences.join(', ')}

APPLICATION:
${result.application}

COUNTERARGUMENTS:
${result.counterargumentsOrAlternatives}

NEXT STEPS:
${result.practicalNextSteps.join('\n- ')}

QUESTIONS FOR QUALIFIED LAWYER:
${result.questionsToAskALawyer.join('\n? ')}

DISCLAIMER: Informational analysis by LegalEase: AI. Not professional legal advice.`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Presets */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 legal-heading">
              Structured Legal Analyzer
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Framework adheres to IRAC methodology (Issue · Relevant Law · Facts vs Assumptions · Application · Next Steps)
            </p>
          </div>

          {/* Quick Scenario Loader */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Test Scenarios:</span>
            <button
              onClick={() => loadSample('consumerDispute')}
              className="text-xs font-medium px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-200 transition-colors"
            >
              Consumer Warranty Dispute
            </button>
            <button
              onClick={() => loadSample('leaseAgreement')}
              className="text-xs font-medium px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-200 transition-colors"
            >
              Tenant Lock-In & Penalty
            </button>
          </div>
        </div>
      </div>

      {/* Input Panel */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Legal Question / Primary Issue
                </label>
                <button
                  type="button"
                  onClick={() => handleRedactField('query')}
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" /> Scrub PII
                </button>
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Can an employer enforce a 2-year non-compete clause under Indian contract law after I resign?"
                rows={3}
                className="w-full text-xs p-3 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Factual Background & Dates
                </label>
                <button
                  type="button"
                  onClick={() => handleRedactField('facts')}
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" /> Scrub PII
                </button>
              </div>
              <textarea
                value={facts}
                onChange={(e) => setFacts(e.target.value)}
                placeholder="State the chronological facts clearly. Mention what happened, dates, communications, monetary amounts, or terms agreed upon..."
                rows={6}
                className="w-full text-xs p-3 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
              />
            </div>

            {/* Optional Document Attachment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Attach Supporting Document (Optional)
              </label>
              <div className="border border-dashed border-stone-300 rounded-lg p-3 bg-stone-50 text-center">
                {uploadedFile ? (
                  <div className="flex items-center justify-between text-xs text-stone-800">
                    <span className="truncate max-w-[200px] flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      {uploadedFile.name}
                    </span>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-red-600 hover:underline text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-1">
                    <UploadCloud className="w-5 h-5 text-stone-400" />
                    <span className="text-xs font-medium text-stone-600">
                      Upload PDF, Notice, or Document Image
                    </span>
                    <span className="text-[10px] text-stone-600">Processed securely via multimodal Gemini</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Jurisdiction & Audience Reminder Card */}
            <div className="p-3 bg-stone-100/70 rounded-lg text-[11px] text-stone-600 space-y-1">
              <div className="flex items-center justify-between font-semibold text-stone-800">
                <span>Active Jurisdiction:</span>
                <span className="text-stone-900">{jurisdiction.country} {jurisdiction.state ? `(${jurisdiction.state})` : ''}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Target Depth:</span>
                <span className="text-stone-700">{audienceLevel} Mode</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Language:</span>
                <span className="text-stone-700">{language}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Legal Analysis...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4 text-amber-300" />
                  <span>Analyze Legal Scenario</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Display Panel */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
              {/* Header with Tab Navigation */}
              <div className="border-b border-stone-200 p-4 bg-stone-50/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg text-xs">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Short Answer & Core Issue
                  </button>
                  <button
                    onClick={() => setActiveTab('irac')}
                    className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                      activeTab === 'irac'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Law & Application (IRAC)
                  </button>
                  <button
                    onClick={() => setActiveTab('lawyerPrep')}
                    className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                      activeTab === 'lawyerPrep'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Next Steps & Lawyer Questions
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAnalysis}
                    className="p-1.5 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-md text-xs font-medium flex items-center gap-1"
                    title="Copy full analysis to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-md text-xs font-medium flex items-center gap-1 no-print"
                    title="Print analysis briefing"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Overview & Short Answer */}
              {activeTab === 'overview' && (
                <div className="p-6 space-y-6">
                  {/* Short Answer Callout */}
                  <div className="p-4 bg-amber-50/60 border-l-4 border-amber-500 rounded-r-lg">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                      Short Answer
                    </span>
                    <p className="text-sm text-stone-800 leading-relaxed font-medium">
                      {result.shortAnswer}
                    </p>
                  </div>

                  {/* Core Issue */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Specific Legal Issue Identified
                    </h3>
                    <p className="text-base font-semibold text-stone-900 legal-heading">
                      {result.issue}
                    </p>
                  </div>

                  {/* Facts Separated from Assumptions */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Facts Stated by User
                      </h4>
                      <ul className="space-y-1.5 text-xs text-stone-700">
                        {result.factsSeparated.userStatedFacts?.map((fact, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-stone-600 font-bold">•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        Assumptions & Missing Context
                      </h4>
                      <ul className="space-y-1.5 text-xs text-stone-700">
                        {result.factsSeparated.assumptionsOrInferences?.map((asm, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{asm}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Key Considerations */}
                  {result.importantConsiderations?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                        Important Considerations & Uncertainties
                      </h4>
                      <div className="space-y-2">
                        {result.importantConsiderations.map((item, idx) => (
                          <div key={idx} className="p-3 bg-stone-50 rounded border border-stone-200 text-xs text-stone-700 flex items-start gap-2">
                            <span className="font-semibold text-stone-500">§{idx + 1}</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: IRAC Deep Dive */}
              {activeTab === 'irac' && (
                <div className="p-6 space-y-6">
                  {/* Relevant Law Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-stone-600" />
                        Governing Law, Statutes & Doctrines
                      </h3>
                      <span className="text-[11px] text-stone-600 font-medium">Verified Authorities Only</span>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 font-legal text-stone-800 text-sm leading-relaxed whitespace-pre-wrap">
                      {result.relevantLaw}
                    </div>
                  </div>

                  {/* Application Section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Legal Application to Facts
                    </h3>
                    <div className="p-4 bg-white rounded-lg border border-stone-200 text-stone-800 text-xs leading-relaxed space-y-2">
                      <p className="whitespace-pre-wrap">{result.application}</p>
                    </div>
                  </div>

                  {/* Counterarguments & Alternative Strategies */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Counterarguments & Alternatives Considered
                    </h3>
                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-700 leading-relaxed">
                      {result.counterargumentsOrAlternatives}
                    </div>
                  </div>

                  {/* Sources List */}
                  {result.sources?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                        Authoritative Sources Referenced
                      </h4>
                      <ul className="space-y-1 text-xs text-stone-600">
                        {result.sources.map((src, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                            <span>{src}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Practical Next Steps & Lawyer Prep */}
              {activeTab === 'lawyerPrep' && (
                <div className="p-6 space-y-6">
                  {/* Practical Next Steps */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-1.5">
                      <ChevronRight className="w-4 h-4 text-emerald-600" />
                      Practical Informational Next Steps
                    </h3>
                    <div className="space-y-2.5">
                      {result.practicalNextSteps?.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200"
                        >
                          <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-stone-800 leading-relaxed font-medium">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Questions to Ask Your Lawyer */}
                  <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-700" />
                      Questions Prepared for Your Qualified Lawyer
                    </h3>
                    <p className="text-xs text-stone-600 mb-3">
                      Take these questions to your legal consultation to get precise, actionable advice in less time.
                    </p>
                    <div className="space-y-2">
                      {result.questionsToAskALawyer?.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white rounded border border-amber-200/70 text-xs font-medium text-stone-800 flex items-start gap-2"
                        >
                          <span className="text-amber-700 font-bold">Q{idx + 1}:</span>
                          <span>{q}</span>
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
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-stone-800 legal-heading">
                Ready to Analyze Your Legal Scenario
              </h3>
              <p className="text-xs text-stone-500 max-w-md mt-1.5 leading-relaxed">
                Enter your question and facts on the left, or click a test scenario to inspect structured IRAC breakdown, relevant legislation, and lawyer consultation prep.
              </p>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => loadSample('consumerDispute')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-md border border-stone-200 transition-colors"
                >
                  Load Consumer Dispute
                </button>
                <button
                  onClick={() => loadSample('leaseAgreement')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-md border border-stone-200 transition-colors"
                >
                  Load Tenancy Scenario
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
