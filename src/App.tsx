/**
 * LegalEase: AI — Master Legal Assistant Application
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Scale,
  FileText,
  FileEdit,
  Calendar,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Gavel
} from 'lucide-react';
import { Jurisdiction, AudienceLevel } from './types/legal';
import { Header } from './components/Header';
import { HighRiskBanner } from './components/HighRiskBanner';
import { PrivacyShieldModal } from './components/PrivacyShieldModal';
import { LegalAnalyzerTab } from './components/LegalAnalyzerTab';
import { DocumentReviewTab } from './components/DocumentReviewTab';
import { LegalDraftingTab } from './components/LegalDraftingTab';
import { CaseOrganizerTab } from './components/CaseOrganizerTab';
import { ConceptExplainerTab } from './components/ConceptExplainerTab';
import { LegalChatAssistant } from './components/LegalChatAssistant';

export default function App() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>({
    country: 'India',
    state: 'Maharashtra',
    courtOrAuthority: 'High Court / Civil Court',
    era: 'Current (2026)',
  });

  const [audienceLevel, setAudienceLevel] = useState<AudienceLevel>('Beginner');
  const [language, setLanguage] = useState('English');
  const [activeTab, setActiveTab] = useState<'analyzer' | 'contracts' | 'drafting' | 'organizer' | 'glossary' | 'chat'>('analyzer');

  // Modals
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isHighRiskModalOpen, setIsHighRiskModalOpen] = useState(false);
  const [specificRisk, setSpecificRisk] = useState<{ category?: string; warning?: string } | null>(null);

  const handleTriggerHighRisk = (risk: { category?: string; warning?: string }) => {
    setSpecificRisk(risk);
    setIsHighRiskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation & Jurisdiction Header */}
      <Header
        jurisdiction={jurisdiction}
        onJurisdictionChange={setJurisdiction}
        audienceLevel={audienceLevel}
        onAudienceLevelChange={setAudienceLevel}
        language={language}
        onLanguageChange={setLanguage}
        onOpenPrivacyShield={() => setIsPrivacyModalOpen(true)}
        onOpenHighRiskHelp={() => setIsHighRiskModalOpen(true)}
      />

      {/* Main Workspaces Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Workspace Tab Navigation Bar (Functional Buttons) */}
        <div className="bg-white rounded-xl border border-stone-200 p-1.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analyzer'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Scale className={`w-4 h-4 ${activeTab === 'analyzer' ? 'text-amber-300' : 'text-stone-500'}`} />
              <span>IRAC Legal Analyzer</span>
            </button>

            <button
              onClick={() => setActiveTab('contracts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'contracts'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'contracts' ? 'text-amber-300' : 'text-stone-500'}`} />
              <span>Document & Contract Review</span>
            </button>

            <button
              onClick={() => setActiveTab('drafting')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'drafting'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileEdit className={`w-4 h-4 ${activeTab === 'drafting' ? 'text-amber-300' : 'text-stone-500'}`} />
              <span>Drafting Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('organizer')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'organizer'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeTab === 'organizer' ? 'text-amber-300' : 'text-stone-500'}`} />
              <span>Case Timeline & Organizer</span>
            </button>

            <button
              onClick={() => setActiveTab('glossary')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'glossary'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'glossary' ? 'text-amber-300' : 'text-stone-500'}`} />
              <span>Plain Legal Dictionary</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${activeTab === 'chat' ? 'text-amber-300' : 'text-stone-500'}`} />
              <span>Interactive Counsel Chat</span>
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3 text-xs text-stone-500">
            <span>Jurisdiction:</span>
            <span className="font-semibold text-stone-800">{jurisdiction.country}</span>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'analyzer' && (
          <LegalAnalyzerTab
            jurisdiction={jurisdiction}
            audienceLevel={audienceLevel}
            language={language}
            onTriggerHighRisk={handleTriggerHighRisk}
          />
        )}

        {activeTab === 'contracts' && (
          <DocumentReviewTab jurisdiction={jurisdiction} />
        )}

        {activeTab === 'drafting' && (
          <LegalDraftingTab jurisdiction={jurisdiction} />
        )}

        {activeTab === 'organizer' && (
          <CaseOrganizerTab jurisdiction={jurisdiction} />
        )}

        {activeTab === 'glossary' && (
          <ConceptExplainerTab
            jurisdiction={jurisdiction}
            audienceLevel={audienceLevel}
            onAudienceLevelChange={setAudienceLevel}
          />
        )}

        {activeTab === 'chat' && (
          <LegalChatAssistant
            jurisdiction={jurisdiction}
            audienceLevel={audienceLevel}
            language={language}
            onTriggerHighRisk={handleTriggerHighRisk}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Scale className="w-4 h-4 text-stone-600" />
            <span className="font-semibold text-stone-900">LegalEase: AI</span>
            <span>·</span>
            <span>Informational Legal Assistant</span>
          </div>
          <p className="text-center sm:text-right leading-relaxed max-w-xl text-[11px] text-stone-500">
            Compliant with LegalEase: AI Master System Prompt. Strict no-fabrication policy. Never substitute AI analysis for independent legal representation by an advocate or solicitor.
          </p>
        </div>
      </footer>

      {/* Privacy Shield Modal */}
      <PrivacyShieldModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* High Risk Urgent Banner Modal */}
      <HighRiskBanner
        isOpen={isHighRiskModalOpen}
        onClose={() => {
          setIsHighRiskModalOpen(false);
          setSpecificRisk(null);
        }}
        specificRisk={specificRisk}
      />
    </div>
  );
}
