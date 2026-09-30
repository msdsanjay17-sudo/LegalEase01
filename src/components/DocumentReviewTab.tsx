import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  UploadCloud,
  FileCheck,
  ShieldAlert,
  Loader2,
  Copy,
  ChevronDown,
  Layers,
  Sparkles,
  BookOpen,
  DollarSign,
  Calendar,
  Users,
  ShieldCheck
} from 'lucide-react';
import { Jurisdiction, DocumentReviewResult, ContractRiskItem, RiskCategory } from '../types/legal';
import { SAMPLE_DOCUMENTS } from '../utils/preloadedData';
import { sanitizeLegalText } from '../utils/redact';

interface DocumentReviewTabProps {
  jurisdiction: Jurisdiction;
}

export const DocumentReviewTab: React.FC<DocumentReviewTabProps> = ({ jurisdiction }) => {
  const [docText, setDocText] = useState('');
  const [docTitle, setDocTitle] = useState('Residential Tenancy Agreement');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; mimeType: string; base64: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'risks' | 'extracted' | 'glossary' | 'missing'>('risks');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
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

  const loadSampleDoc = (type: 'lease' | 'freelance') => {
    if (type === 'lease') {
      setDocTitle('Residential Lease Agreement (Mumbai)');
      setDocText(SAMPLE_DOCUMENTS.leaseAgreement);
      setUploadedFile(null);
    } else {
      setDocTitle('Freelance Software & Design Agreement (US)');
      setDocText(SAMPLE_DOCUMENTS.serviceAgreement);
      setUploadedFile(null);
    }
  };

  const handleReview = async () => {
    if (!docText.trim() && !uploadedFile) {
      setError('Please paste document text or upload a document file.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        documentText: docText,
        documentTitle: docTitle,
        jurisdiction,
      };

      if (uploadedFile) {
        payload.fileData = {
          base64: uploadedFile.base64,
          mimeType: uploadedFile.mimeType,
          name: uploadedFile.name,
        };
      }

      const res = await fetch('/api/legal/document-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to review document.');
      }

      const data: DocumentReviewResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Error occurred while reviewing the document.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRisks = result?.contractRiskReview
    ? selectedRiskCategory === 'all'
      ? result.contractRiskReview
      : result.contractRiskReview.filter((r) => r.category === selectedRiskCategory)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 legal-heading">
              Document & Contract Risk Review
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Extracts parties, dates, obligations & categorizes notable clauses into 13 statutory risk dimensions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Sample Contracts:</span>
            <button
              onClick={() => loadSampleDoc('lease')}
              className="text-xs font-medium px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-200 transition-colors"
            >
              11-Month Lease
            </button>
            <button
              onClick={() => loadSampleDoc('freelance')}
              className="text-xs font-medium px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-200 transition-colors"
            >
              Freelance Agreement
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Document Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Document Identifier / Title
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Master Services Agreement / Tenancy Contract"
                className="w-full text-xs p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
              />
            </div>

            {/* Upload Box */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Upload Contract / Legal Notice
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
                      Upload PDF, Scanned Image, or Document
                    </span>
                    <span className="text-[10px] text-stone-600">Multimodal Gemini OCR & analysis</span>
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

            {/* Paste Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Or Paste Document Text
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (docText) {
                      const res = sanitizeLegalText(docText);
                      setDocText(res.cleanedText);
                    }
                  }}
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" /> Scrub PII
                </button>
              </div>
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                placeholder="Paste the agreement clauses, notices, or terms here..."
                rows={10}
                className="w-full text-xs font-mono p-3 border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleReview}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reviewing Clauses & Extracting Provisions...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>Execute Document & Risk Review</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
              {/* Top Summary Banner */}
              <div className="p-5 border-b border-stone-200 bg-stone-50/70">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-semibold text-stone-900">{result.documentType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{result.extractedElements.governingLaw || 'Jurisdiction Specified'}</span>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    {result.contractRiskReview?.length || 0} Clauses Flagged
                  </span>
                </div>
                <p className="text-xs text-stone-800 leading-relaxed font-medium">
                  {result.plainLanguageSummary}
                </p>
              </div>

              {/* Sub Navigation */}
              <div className="border-b border-stone-200 px-4 py-2 bg-stone-100/50 flex flex-wrap items-center gap-1 text-xs">
                <button
                  onClick={() => setActiveSubTab('risks')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    activeSubTab === 'risks' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Clause Risk Matrix ({result.contractRiskReview?.length || 0})
                </button>
                <button
                  onClick={() => setActiveSubTab('extracted')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    activeSubTab === 'extracted' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Extracted Parties & Deadlines
                </button>
                <button
                  onClick={() => setActiveSubTab('missing')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    activeSubTab === 'missing' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Ambiguities & Missing Info ({result.ambiguitiesAndMissingInfo?.length || 0})
                </button>
                <button
                  onClick={() => setActiveSubTab('glossary')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    activeSubTab === 'glossary' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Legal Terms Found ({result.glossaryOfTermsFound?.length || 0})
                </button>
              </div>

              {/* View 1: Clause Risk Matrix */}
              {activeSubTab === 'risks' && (
                <div className="p-5 space-y-4">
                  {/* Category Filter */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-200">
                    <span className="text-xs font-semibold text-stone-700">Filter Risk Dimension:</span>
                    <select
                      value={selectedRiskCategory}
                      onChange={(e) => setSelectedRiskCategory(e.target.value)}
                      className="text-xs font-medium text-stone-800 bg-stone-50 border border-stone-300 rounded-md px-2.5 py-1 focus:outline-none"
                    >
                      <option value="all">All Risk Categories ({result.contractRiskReview.length})</option>
                      {Array.from(new Set(result.contractRiskReview.map((r) => r.category))).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Risks List */}
                  <div className="space-y-3">
                    {filteredRisks.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border border-stone-200 bg-stone-50/50 space-y-2 hover:bg-stone-50 transition-colors"
                      >
                        {/* Unboxed Metadata Header (Zero-Pill Discipline) */}
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900">{item.category}</span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={`font-medium ${
                                item.riskLevel === 'high'
                                  ? 'text-red-700 font-bold'
                                  : item.riskLevel === 'moderate'
                                  ? 'text-amber-800'
                                  : 'text-stone-600'
                              }`}
                            >
                              {item.riskLevel.toUpperCase()} RISK
                            </span>
                          </div>
                        </div>

                        {/* Quoted Clause */}
                        {item.clauseSnippet && (
                          <div className="p-2.5 bg-white border border-stone-200 rounded font-mono text-[11px] text-stone-800 leading-relaxed">
                            "{item.clauseSnippet}"
                          </div>
                        )}

                        {/* Neutral Observation */}
                        <p className="text-xs text-stone-700 leading-relaxed font-medium">
                          {item.observation}
                        </p>

                        {/* Recommendation for Lawyer */}
                        <div className="pt-2 border-t border-stone-200 text-xs text-amber-900 flex items-start gap-1.5">
                          <span className="font-bold shrink-0">Ask your lawyer:</span>
                          <span className="text-stone-700">{item.recommendationForLawyer}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-stone-100 rounded-lg text-xs text-stone-500 border border-stone-200">
                    <p>{result.overallVerdictNotice}</p>
                  </div>
                </div>
              )}

              {/* View 2: Extracted Parties, Deadlines, Amounts */}
              {activeSubTab === 'extracted' && (
                <div className="p-5 space-y-6">
                  {/* Parties Section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-stone-600" /> Parties Identified
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {result.extractedElements.parties?.map((p, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                          <p className="font-bold text-stone-900">{p.name}</p>
                          <p className="text-stone-500 text-[11px]">{p.role}</p>
                          {p.details && <p className="text-stone-600 mt-1">{p.details}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Amounts & Penalties */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" /> Monetary Amounts & Payment Terms
                    </h3>
                    <div className="space-y-2">
                      {result.extractedElements.monetaryAmounts?.map((m, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-stone-900">{m.amount}</span>
                            <span className="text-stone-600 ml-2 font-medium">{m.purpose}</span>
                          </div>
                          {m.dueOrCondition && <span className="text-[11px] text-stone-500">{m.dueOrCondition}</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deadlines & Dates */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600" /> Key Dates & Critical Deadlines
                    </h3>
                    <div className="space-y-2">
                      {result.extractedElements.deadlines?.map((d, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                          <div className="flex items-center justify-between font-semibold text-stone-900">
                            <span>{d.title}</span>
                            <span className="text-amber-800">{d.timeframe}</span>
                          </div>
                          {d.consequences && (
                            <p className="text-stone-600 text-[11px] mt-1">Consequences: {d.consequences}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Termination & Dispute Resolution */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                      <h4 className="font-bold text-stone-900 mb-1">Termination Provisions</h4>
                      <p className="text-stone-700 leading-relaxed">{result.extractedElements.terminationProvisions || 'No standard termination clause found.'}</p>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                      <h4 className="font-bold text-stone-900 mb-1">Dispute Resolution & Forum</h4>
                      <p className="text-stone-700 leading-relaxed">{result.extractedElements.disputeResolution || 'No explicit dispute resolution clause found.'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* View 3: Ambiguities & Missing Info */}
              {activeSubTab === 'missing' && (
                <div className="p-5 space-y-4">
                  <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Identified Ambiguities & Crucial Missing Clauses
                    </h3>
                    <p className="text-xs text-stone-600 mb-3">
                      Standard contracts typically include these safeguards. Review these gaps with your legal counsel before signing.
                    </p>
                    <div className="space-y-2.5">
                      {result.ambiguitiesAndMissingInfo?.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white rounded border border-amber-200/80 text-xs text-stone-800 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* View 4: Plain Legal Glossary */}
              {activeSubTab === 'glossary' && (
                <div className="p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Plain-Language Glossary of Terms Found in This Document
                  </h3>
                  <div className="space-y-3">
                    {result.glossaryOfTermsFound?.map((termItem, idx) => (
                      <div key={idx} className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-stone-900 text-sm legal-heading">{termItem.term}</h4>
                          <span className="text-[11px] text-stone-500 font-medium">Plain-Language Translation</span>
                        </div>
                        <div className="text-xs space-y-1">
                          <p><strong className="text-stone-800">Legal Meaning:</strong> <span className="text-stone-600">{termItem.legalMeaning}</span></p>
                          <p><strong className="text-stone-800">In Simple Words:</strong> <span className="text-stone-700">{termItem.simpleWords}</span></p>
                          <p><strong className="text-stone-800">Why It Matters:</strong> <span className="text-stone-700">{termItem.whyItMatters}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-stone-800 legal-heading">
                Upload or Paste a Contract for Risk Review
              </h3>
              <p className="text-xs text-stone-500 max-w-md mt-1.5 leading-relaxed">
                Analyze residential leases, NDAs, employment agreements, or notices. LegalEase: AI will extract parties, financial exposure, lock-in periods, and 13 risk dimensions.
              </p>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => loadSampleDoc('lease')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-md border border-stone-200 transition-colors"
                >
                  Load Sample Tenancy Lease
                </button>
                <button
                  onClick={() => loadSampleDoc('freelance')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-md border border-stone-200 transition-colors"
                >
                  Load Sample Freelance Contract
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
