import React, { useState } from 'react';
import {
  Scale,
  Globe2,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Info,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { Jurisdiction, AudienceLevel } from '../types/legal';

interface HeaderProps {
  jurisdiction: Jurisdiction;
  onJurisdictionChange: (j: Jurisdiction) => void;
  audienceLevel: AudienceLevel;
  onAudienceLevelChange: (level: AudienceLevel) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onOpenPrivacyShield: () => void;
  onOpenHighRiskHelp: () => void;
}

const COUNTRIES = [
  { code: 'India', name: 'India (Central & State Law)', defaultState: 'Maharashtra' },
  { code: 'United States', name: 'United States (Federal & State)', defaultState: 'California' },
  { code: 'United Kingdom', name: 'United Kingdom (England & Wales)', defaultState: 'England' },
  { code: 'Canada', name: 'Canada (Federal & Provincial)', defaultState: 'Ontario' },
  { code: 'Australia', name: 'Australia (Commonwealth & State)', defaultState: 'New South Wales' },
  { code: 'Singapore', name: 'Singapore', defaultState: 'National' },
  { code: 'General / International', name: 'General / International Common Law', defaultState: 'General' },
];

const AUDIENCE_LEVELS: { id: AudienceLevel; label: string; desc: string }[] = [
  { id: 'Beginner', label: 'Beginner', desc: 'Plain English, easy analogies' },
  { id: 'Student', label: 'Student', desc: 'Structured IRAC & statutory doctrines' },
  { id: 'Professional', label: 'Business Professional', desc: 'Concise, commercial exposure focus' },
  { id: 'Lawyer', label: 'Advocate / Researcher', desc: 'Detailed authorities & distinctions' },
  { id: 'ELI10', label: "Explain Like I'm 10", desc: 'Ultra-simplified concepts' },
];

export const Header: React.FC<HeaderProps> = ({
  jurisdiction,
  onJurisdictionChange,
  audienceLevel,
  onAudienceLevelChange,
  language,
  onLanguageChange,
  onOpenPrivacyShield,
  onOpenHighRiskHelp,
}) => {
  const [showJurisdictionModal, setShowJurisdictionModal] = useState(false);
  const [tempCountry, setTempCountry] = useState(jurisdiction.country);
  const [tempState, setTempState] = useState(jurisdiction.state || '');
  const [tempCourt, setTempCourt] = useState(jurisdiction.courtOrAuthority || '');
  const [tempEra, setTempEra] = useState(jurisdiction.era || 'Current (2026)');

  const handleSaveJurisdiction = () => {
    onJurisdictionChange({
      country: tempCountry,
      state: tempState,
      courtOrAuthority: tempCourt,
      era: tempEra,
    });
    setShowJurisdictionModal(false);
  };

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30">
      {/* Top Utility & Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center shadow-sm">
              <Scale className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-brand text-xl font-bold tracking-tight text-stone-950">
                  LegalEase: AI
                </span>
                <span className="text-xs text-stone-600 font-medium hidden sm:inline">
                  Informational Legal Assistant
                </span>
              </div>
              <p className="text-xs text-stone-600">
                Transparent legal information · Contract review · Drafting · Case chronology
              </p>
            </div>
          </div>

          {/* Controls: Jurisdiction, Audience, Privacy, Urgent Help */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Jurisdiction Badge Button */}
            <button
              onClick={() => setShowJurisdictionModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors border border-stone-200"
              title="Click to set country, state, court, and era"
            >
              <Globe2 className="w-3.5 h-3.5 text-stone-600" />
              <span className="truncate max-w-[150px] font-semibold text-stone-900">
                {jurisdiction.country} {jurisdiction.state ? `(${jurisdiction.state})` : ''}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>

            {/* Audience Level Selector */}
            <div className="relative">
              <select
                value={audienceLevel}
                onChange={(e) => onAudienceLevelChange(e.target.value as AudienceLevel)}
                className="text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-md px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-400"
                title="Select explanation depth and style"
              >
                {AUDIENCE_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    Level: {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-md px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-400"
            >
              <option value="English">English</option>
              <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
              <option value="Spanish (Español)">Spanish (Español)</option>
              <option value="French (Français)">French (Français)</option>
              <option value="German (Deutsch)">German (Deutsch)</option>
              <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
              <option value="Marathi (मराठी)">Marathi (मराठी)</option>
            </select>

            {/* Privacy Shield Button */}
            <button
              onClick={onOpenPrivacyShield}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
              title="Client-side redaction tool to scrub Aadhaar, SSN, PAN, Card & Bank details"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Privacy Shield</span>
            </button>

            {/* Urgent / High-Risk Hotline Help */}
            <button
              onClick={onOpenHighRiskHelp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
              title="Urgent guidelines for high-risk situations (arrest, custody, domestic safety, deadlines)"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Urgent Helpline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Transparent Legal Disclaimer Bar */}
      <div className="bg-stone-900 text-stone-300 text-xs px-4 py-1.5 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <p className="leading-snug">
              <strong className="text-stone-100">Informational Notice:</strong> LegalEase: AI provides legal information, document organization, and research assistance. It does not provide legal representation or replace consultation with a qualified advocate or attorney.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-stone-400 text-[11px] shrink-0">
            <span>Section 8: Strict No-Fabrication</span>
            <span>·</span>
            <span>Section 2: Jurisdiction-First</span>
            <span>·</span>
            <span>Section 9: Sensitive Data Masked</span>
          </div>
        </div>
      </div>

      {/* Jurisdiction Config Modal */}
      {showJurisdictionModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-lg w-full p-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-stone-700" />
                <h3 className="text-base font-semibold text-stone-900">Jurisdiction Configuration</h3>
              </div>
              <button
                onClick={() => setShowJurisdictionModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 mt-3">
              Per Section 2 of the LegalEase: AI framework, legal principles, statutes, and procedural rules depend strictly on your target jurisdiction. Never assume a law from one jurisdiction applies to another.
            </p>

            <div className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-medium text-stone-800 mb-1">Country / National Framework</label>
                <select
                  value={tempCountry}
                  onChange={(e) => {
                    setTempCountry(e.target.value);
                    const match = COUNTRIES.find((c) => c.code === e.target.value);
                    if (match && match.defaultState) {
                      setTempState(match.defaultState);
                    }
                  }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-800 mb-1">
                  State / Province / Union Territory
                </label>
                <input
                  type="text"
                  value={tempState}
                  onChange={(e) => setTempState(e.target.value)}
                  placeholder="e.g. Maharashtra, California, Ontario, Delhi"
                  className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Crucial for rent control, land revenue, local consumer courts, state labor codes, or municipal bylaws.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-800 mb-1">Court / Forum / Authority</label>
                  <input
                    type="text"
                    value={tempCourt}
                    onChange={(e) => setTempCourt(e.target.value)}
                    placeholder="e.g. High Court, Consumer Commission, RERA, Civil Court"
                    className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-800 mb-1">Time Era / Date Applicable</label>
                  <select
                    value={tempEra}
                    onChange={(e) => setTempEra(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none"
                  >
                    <option value="Current (2026)">Current Law (2026)</option>
                    <option value="Pre-BNS Indian Law (IPC/CrPC)">Historical Pre-BNS Indian Law</option>
                    <option value="Specific Historical Date">Specific Historical Date</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowJurisdictionModal(false)}
                className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJurisdiction}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md shadow-xs transition-colors"
              >
                Set Jurisdiction Context
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
