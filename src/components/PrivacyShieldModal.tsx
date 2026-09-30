import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, Copy, Trash2, ArrowRight } from 'lucide-react';
import { sanitizeLegalText, RedactionResult } from '../utils/redact';

interface PrivacyShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySanitizedText?: (cleanedText: string) => void;
}

export const PrivacyShieldModal: React.FC<PrivacyShieldModalProps> = ({
  isOpen,
  onClose,
  onApplySanitizedText,
}) => {
  const [inputText, setInputText] = useState('');
  const [redactionResult, setRedactionResult] = useState<RedactionResult | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleScanAndRedact = () => {
    if (!inputText.trim()) return;
    const res = sanitizeLegalText(inputText);
    setRedactionResult(res);
  };

  const handleCopy = () => {
    if (!redactionResult) return;
    navigator.clipboard.writeText(redactionResult.cleanedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToActiveForm = () => {
    if (redactionResult && onApplySanitizedText) {
      onApplySanitizedText(redactionResult.cleanedText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-2xl w-full p-6 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                Privacy Shield & PII Sanitizer
              </h3>
              <p className="text-xs text-stone-500">
                Section 9 Compliance: Scrub sensitive identifiers before submitting legal queries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600">
            <p className="font-semibold text-stone-900 mb-1">
              Protected Identifiers Automatically Scrubbed:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 text-stone-700">
              <span>✓ Aadhaar Numbers (12-digit)</span>
              <span>✓ US Social Security (SSN)</span>
              <span>✓ Indian PAN numbers</span>
              <span>✓ Credit / Debit card nums</span>
              <span>✓ Phone numbers</span>
              <span>✓ Personal email IDs</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Paste Legal Text or Contract to Sanitize:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste any document, message, or notice with personal identifiers..."
              rows={5}
              className="w-full text-xs font-mono p-3 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setInputText('');
                setRedactionResult(null);
              }}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
            <button
              onClick={handleScanAndRedact}
              disabled={!inputText.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-md transition-colors shadow-xs flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Scan & Scrub Sensitive Data
            </button>
          </div>

          {redactionResult && (
            <div className="mt-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-stone-900">
                    Sanitization Complete ({redactionResult.count} identifiers masked)
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> {copied ? 'Copied!' : 'Copy Scrubbed'}
                  </button>
                  {onApplySanitizedText && (
                    <button
                      onClick={handleApplyToActiveForm}
                      className="text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 px-3 py-1 rounded flex items-center gap-1"
                    >
                      Apply to Active Field <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-stone-900 text-stone-200 p-3 rounded-lg text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                {redactionResult.cleanedText}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
