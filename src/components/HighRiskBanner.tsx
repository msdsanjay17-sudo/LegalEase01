import React from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, Clock, ExternalLink } from 'lucide-react';

interface HighRiskBannerProps {
  isOpen: boolean;
  onClose: () => void;
  specificRisk?: {
    category?: string;
    warning?: string;
  } | null;
}

export const HighRiskBanner: React.FC<HighRiskBannerProps> = ({ isOpen, onClose, specificRisk }) => {
  if (!isOpen && !specificRisk?.warning) return null;

  return (
    <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-red-500 max-w-2xl w-full p-6 animate-in zoom-in-95">
        <div className="flex items-start gap-4 pb-4 border-b border-stone-200">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-sm border border-red-200">
                Section 7: High-Risk Legal Protocol
              </span>
              <span className="text-xs text-stone-500">Urgent Safety & Rights Guidance</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">
              Immediate Action Required: Time-Sensitive or Safety Matter
            </h2>
          </div>
        </div>

        {specificRisk?.warning && (
          <div className="my-4 p-3 bg-red-50 border-l-4 border-red-600 rounded-r-md">
            <p className="text-xs font-semibold text-red-900">Detected Trigger:</p>
            <p className="text-sm text-red-800 mt-0.5">{specificRisk.warning}</p>
          </div>
        )}

        <div className="mt-4 space-y-4 text-xs text-stone-700">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-700" />
              Do Not Rely on AI for Imminent Deadlines or Arrest Risks
            </p>
            <p className="text-stone-700 leading-relaxed">
              LegalEase: AI cannot calculate exact jurisdictional limitation days for filing appeals, nor can it provide legal representation during police questioning, detention, or emergency custody hearings.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {/* India Emergency Contacts */}
            <div className="p-3 border border-stone-200 rounded-lg bg-stone-50">
              <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                India Helplines & Legal Aid
              </h4>
              <ul className="space-y-1.5 text-stone-700">
                <li className="flex justify-between items-center">
                  <span>National Free Legal Aid (NALSA):</span>
                  <a href="tel:15100" className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 hover:bg-stone-100">
                    15100
                  </a>
                </li>
                <li className="flex justify-between items-center">
                  <span>Emergency Police / Safety:</span>
                  <a href="tel:112" className="font-bold text-red-700 bg-white px-2 py-0.5 rounded border border-stone-200 hover:bg-stone-100">
                    112
                  </a>
                </li>
                <li className="flex justify-between items-center">
                  <span>Women Helpline (Domestic Abuse):</span>
                  <a href="tel:1091" className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 hover:bg-stone-100">
                    1091 / 181
                  </a>
                </li>
                <li className="flex justify-between items-center">
                  <span>Child Helpline:</span>
                  <a href="tel:1098" className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 hover:bg-stone-100">
                    1098
                  </a>
                </li>
              </ul>
            </div>

            {/* US & International Helplines */}
            <div className="p-3 border border-stone-200 rounded-lg bg-stone-50">
              <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1 mb-2">
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                US / UK / Global Helplines
              </h4>
              <ul className="space-y-1.5 text-stone-700">
                <li className="flex justify-between items-center">
                  <span>US Legal Services Corp (LSC):</span>
                  <a href="https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-aid" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline flex items-center gap-0.5">
                    Find Aid <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li className="flex justify-between items-center">
                  <span>US Domestic Violence Hotline:</span>
                  <a href="tel:18007997233" className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 hover:bg-stone-100">
                    1-800-799-7233
                  </a>
                </li>
                <li className="flex justify-between items-center">
                  <span>UK Citizens Advice:</span>
                  <a href="tel:08001448848" className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 hover:bg-stone-100">
                    0800 144 8848
                  </a>
                </li>
                <li className="flex justify-between items-center">
                  <span>Emergency Services (US/UK):</span>
                  <span className="font-bold text-red-700">911 (US) / 999 (UK)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-3">
            <h4 className="font-bold text-stone-900 mb-1">Standard Practical Steps to Take Right Now:</h4>
            <ol className="list-decimal pl-4 space-y-1 text-stone-600">
              <li><strong>Preserve Evidence:</strong> Do not delete emails, WhatsApp messages, photos, medical certificates, or notices. Make offline copies.</li>
              <li><strong>Maintain Silence if Arrested:</strong> Under constitutional protections (e.g. Art. 20(3) in India, 5th Amendment in US), you have the right against self-incrimination. Request an attorney immediately.</li>
              <li><strong>Do Not Sign Blank Papers:</strong> Never sign admissions, undertakings, or waivers without independent legal advice.</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
          >
            I Understand the Risks
          </button>
        </div>
      </div>
    </div>
  );
};
