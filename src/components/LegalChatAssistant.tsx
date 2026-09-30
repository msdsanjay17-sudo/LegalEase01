import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  Copy,
  UploadCloud,
  FileCheck,
  Scale,
  Sparkles,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Jurisdiction, AudienceLevel } from '../types/legal';
import { sanitizeLegalText } from '../utils/redact';

interface LegalChatAssistantProps {
  jurisdiction: Jurisdiction;
  audienceLevel: AudienceLevel;
  language: string;
  onTriggerHighRisk: (risk: { category?: string; warning?: string }) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const LegalChatAssistant: React.FC<LegalChatAssistantProps> = ({
  jurisdiction,
  audienceLevel,
  language,
  onTriggerHighRisk,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to LegalEase: AI. I am an informational legal assistant adhering strictly to jurisdiction-first and verified-sources standards.

I can help you understand legal concepts, break down complex contracts, draft non-deceptive notices, or organize timelines. How may I assist your legal inquiry today?

(Reminder: I provide legal information, not professional legal representation. Please mask sensitive personal details such as Aadhaar or bank numbers before submitting.)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; mimeType: string; base64: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() && !uploadedFile) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: uploadedFile ? `[Attached: ${uploadedFile.name}]\n${textToSend}` : textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    const fileToSend = uploadedFile;
    setUploadedFile(null);
    setLoading(true);

    try {
      const chatPayload = {
        messages: [...messages, userMsg].map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          content: m.content,
        })),
        jurisdiction,
        audienceLevel,
        language,
        fileData: fileToSend,
      };

      const res = await fetch('/api/legal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatPayload),
      });

      if (!res.ok) {
        throw new Error('Failed to get response from legal assistant.');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Detect high risk keywords in query
      const lower = textToSend.toLowerCase();
      if (
        lower.includes('arrest') ||
        lower.includes('police custody') ||
        lower.includes('domestic violence') ||
        lower.includes('immediate eviction') ||
        lower.includes('limitation expired') ||
        lower.includes('deportation')
      ) {
        onTriggerHighRisk({
          category: 'Potential High-Risk Urgency',
          warning: 'Your query references time-sensitive criminal or safety circumstances. Please review urgent legal aid hotlines.',
        });
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I encountered an error connecting to the service: ${err.message}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Conversation history reset. How can I assist with your legal questions or document analysis?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col h-[700px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center">
            <Scale className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 legal-heading">
              LegalEase: AI Interactive Counsel Desk
            </h3>
            {/* Unboxed metadata following zero-pill discipline */}
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span>Jurisdiction: {jurisdiction.country}</span>
              <span aria-hidden="true">·</span>
              <span>{audienceLevel} Depth</span>
              <span aria-hidden="true">·</span>
              <span>{language}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="text-stone-500 hover:text-stone-800 text-xs flex items-center gap-1 px-2.5 py-1 rounded hover:bg-stone-200 transition-colors"
          title="Clear conversation history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-stone-100/70 border-b border-stone-200 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-stone-500 font-semibold">Quick Prompts:</span>
        <button
          onClick={() => handleSendMessage('What essential questions should I ask an advocate before signing a commercial lease agreement?')}
          className="px-2 py-0.5 bg-white hover:bg-stone-200 border border-stone-200 rounded text-stone-700 transition-colors"
        >
          Lease Questions for Lawyer
        </button>
        <button
          onClick={() => handleSendMessage('Under Indian law, how does Section 27 of the Indian Contract Act treat employee non-compete clauses after employment ends?')}
          className="px-2 py-0.5 bg-white hover:bg-stone-200 border border-stone-200 rounded text-stone-700 transition-colors"
        >
          Post-Employment Non-Compete
        </button>
        <button
          onClick={() => handleSendMessage('Explain the difference between a Void agreement and a Voidable contract with simple examples.')}
          className="px-2 py-0.5 bg-white hover:bg-stone-200 border border-stone-200 rounded text-stone-700 transition-colors"
        >
          Void vs Voidable
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-stone-50/30">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-md bg-stone-900 text-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                <Scale className="w-3.5 h-3.5 text-amber-300" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-stone-900 text-stone-100'
                  : 'bg-white border border-stone-200 text-stone-800 shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap font-legal text-sm">{m.content}</div>
              <div
                className={`text-[10px] mt-2 flex items-center justify-between ${
                  m.role === 'user' ? 'text-stone-400' : 'text-stone-400'
                }`}
              >
                <span>{m.timestamp}</span>
                {m.role === 'assistant' && (
                  <button
                    onClick={() => navigator.clipboard.writeText(m.content)}
                    className="hover:text-stone-700 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-stone-500 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-stone-700" />
            <span>Consulting legal statutes & framework...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-stone-200 bg-white space-y-2">
        {uploadedFile && (
          <div className="flex items-center justify-between bg-stone-100 px-3 py-1.5 rounded-md text-xs text-stone-700">
            <span className="flex items-center gap-1.5 truncate max-w-sm">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              Attached: {uploadedFile.name}
            </span>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-red-600 hover:underline text-[11px]"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <label className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg cursor-pointer transition-colors shrink-0">
            <UploadCloud className="w-5 h-5" />
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask a legal question, describe a situation, or paste contract terms..."
              rows={2}
              className="w-full text-xs p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:ring-1 focus:ring-stone-500 focus:outline-none resize-none font-medium"
            />
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={loading || (!input.trim() && !uploadedFile)}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg shadow-xs transition-colors shrink-0"
            title="Send inquiry"
          >
            <Send className="w-4 h-4 text-amber-300" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-600">
          <span>Press Enter to send · Shift+Enter for new line</span>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Section 9 Privacy-Active
          </span>
        </div>
      </div>
    </div>
  );
};
