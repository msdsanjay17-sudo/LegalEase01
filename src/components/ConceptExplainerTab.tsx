import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  HelpCircle,
  Sparkles,
  Loader2,
  Copy,
  Lightbulb,
  AlertCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Jurisdiction, AudienceLevel, ConceptExplanationResult } from '../types/legal';
import { CURATED_CONCEPTS, LegalConceptItem } from '../utils/preloadedData';

interface ConceptExplainerTabProps {
  jurisdiction: Jurisdiction;
  audienceLevel: AudienceLevel;
  onAudienceLevelChange: (level: AudienceLevel) => void;
}

export const ConceptExplainerTab: React.FC<ConceptExplainerTabProps> = ({
  jurisdiction,
  audienceLevel,
  onAudienceLevelChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customConcept, setCustomConcept] = useState('Indemnity');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConceptExplanationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = ['All', ...Array.from(new Set(CURATED_CONCEPTS.map((c) => c.category)))];

  const filteredConcepts = CURATED_CONCEPTS.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shortSummary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleExplain = async (termToExplain: string) => {
    setLoading(true);
    setError(null);
    setCustomConcept(termToExplain);

    try {
      const res = await fetch('/api/legal/explain-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: termToExplain,
          jurisdiction,
          level: audienceLevel,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to explain concept.');
      }

      const data: ConceptExplanationResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Error occurred while explaining concept.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.concept.toUpperCase()}\n\nLEGAL MEANING:\n${result.legalMeaning}\n\nIN SIMPLE WORDS:\n${result.inSimpleWords}\n\nWHY IT MATTERS:\n${result.whyItMatters}\n\nEXAMPLE:\n${result.concreteExample}\n\nMISCONCEPTIONS:\n${result.commonMisconceptions?.join('\n- ')}`;
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
              Plain-Language Legal Glossary & Concept Explainer
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Section 10 & 18: Demystifying jargon with "Legal Meaning", "In Simple Words", and "Why It Matters" across all accessibility levels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-700">Audience Depth:</span>
            <div className="flex bg-stone-100 p-1 rounded-lg text-xs font-medium">
              {(['Beginner', 'Student', 'Professional', 'ELI10'] as AudienceLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    onAudienceLevelChange(lvl);
                    if (result) handleExplain(customConcept);
                  }}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    audienceLevel === lvl ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {lvl === 'ELI10' ? 'Explain Like 10' : lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Curated Dictionary & Search */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Explore or Search Any Legal Concept
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customConcept}
                    onChange={(e) => setCustomConcept(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExplain(customConcept)}
                    placeholder="e.g. Indemnity, Bail, Force Majeure..."
                    className="w-full text-xs pl-9 pr-3 py-2 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none font-medium"
                  />
                </div>
                <button
                  onClick={() => handleExplain(customConcept)}
                  disabled={loading || !customConcept.trim()}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  <span>Explain</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills (Functional Buttons) */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Concepts List */}
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredConcepts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExplain(item.name)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group ${
                    customConcept.toLowerCase() === item.name.toLowerCase()
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div>
                    {/* Unboxed Metadata (Zero-Pill Discipline) */}
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-0.5">
                      <span className="font-semibold text-stone-900">{item.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category}</span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-1">{item.shortSummary}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Concept Breakdown Card */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
              {/* Concept Title Header */}
              <div className="p-5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-stone-900 legal-heading">
                    {result.concept}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                    <span>Target Depth: {audienceLevel} Mode</span>
                    <span aria-hidden="true">·</span>
                    <span>Jurisdiction: {jurisdiction.country}</span>
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-white border border-stone-200 text-stone-700 hover:text-stone-900 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* 1. Legal Meaning */}
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    1. Formal Legal Meaning
                  </span>
                  <p className="text-sm font-legal text-stone-900 leading-relaxed">
                    {result.legalMeaning}
                  </p>
                </div>

                {/* 2. In Simple Words */}
                <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200/80 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                    2. In Simple Words (Everyday Translation)
                  </span>
                  <p className="text-sm text-stone-800 leading-relaxed font-medium">
                    {result.inSimpleWords}
                  </p>
                </div>

                {/* 3. Why It Matters */}
                <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200/80 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
                    3. Why It Matters in Real Life
                  </span>
                  <p className="text-sm text-stone-800 leading-relaxed font-medium">
                    {result.whyItMatters}
                  </p>
                </div>

                {/* 4. Concrete Example */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Concrete Scenario / Example
                  </h4>
                  <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-800 leading-relaxed">
                    {result.concreteExample}
                  </div>
                </div>

                {/* 5. Common Misconceptions */}
                {result.commonMisconceptions?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-500" /> Common Misconceptions & Myths
                    </h4>
                    <div className="space-y-2">
                      {result.commonMisconceptions.map((misc, idx) => (
                        <div key={idx} className="p-3 bg-red-50/50 rounded border border-red-200/60 text-xs text-stone-800 flex items-start gap-2">
                          <span className="text-red-700 font-bold shrink-0">✕</span>
                          <span>{misc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Pro-Tip for Consulting Lawyer */}
                {result.proTipForConsultingLawyer && (
                  <div className="p-3.5 bg-stone-900 text-stone-200 rounded-lg text-xs space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                      Advocate Consultation Pro-Tip
                    </span>
                    <p className="leading-relaxed">{result.proTipForConsultingLawyer}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-stone-800 legal-heading">
                Select a Legal Term to Demystify
              </h3>
              <p className="text-xs text-stone-500 max-w-md mt-1.5 leading-relaxed">
                Click any concept on the left or type your own term (e.g. Indemnity, Bail, Liquidated Damages, Res Judicata). LegalEase: AI explains the legal meaning, simple translation, and practical impact.
              </p>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleExplain('Indemnity')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-md border border-stone-200 transition-colors"
                >
                  Explain "Indemnity"
                </button>
                <button
                  onClick={() => handleExplain('Force Majeure')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-md border border-stone-200 transition-colors"
                >
                  Explain "Force Majeure"
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
