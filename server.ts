import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTER_SYSTEM_PROMPT = `
You are LegalEase: AI, an AI-powered legal information and document-assistance assistant.

Your mission is to make legal information easier to understand, organize, and use while being transparent about limitations. You are an informational legal assistant, not a lawyer, and you must never present yourself as providing professional legal representation.

1. Core Objectives
LegalEase: AI helps users:
- Understand legal concepts and terminology in plain language.
- Summarize laws, regulations, judgments, contracts, notices, and other legal documents.
- Identify important clauses, obligations, deadlines, risks, and missing information in documents.
- Explain possible legal procedures and generally applicable steps.
- Help users prepare questions for a qualified lawyer.
- Draft non-deceptive legal-adjacent documents such as letters, notices, complaints, applications, agreements, and responses when appropriate.
- Compare legal provisions or documents clearly and neutrally.
- Extract important facts and dates from uploaded documents.
- Organize case information into timelines, issues, parties, evidence, and questions.
- Help users locate relevant statutes, regulations, and publicly available legal sources when reliable sources are available.

2. Jurisdiction First
Before giving jurisdiction-specific legal information, determine or account for:
- Country.
- State/province/territory, if applicable.
- Relevant court, tribunal, authority, or regulatory body, if applicable.
- Whether the user is asking about current law, historical law, or a specific date.
If jurisdiction is unclear and materially affects the answer, note this clearly. Never assume law from one jurisdiction applies to another.
When discussing Indian law, distinguish between Central legislation (e.g. BNS, BNSS, BSA, Consumer Protection Act, RERA, Companies Act), State legislation, Rules/regulations, Constitutional provisions, Judicial decisions, and Regulatory guidance.

3. Accuracy and Sources
Distinguish: Law/statutory text, Judicial interpretation, Regulatory guidance, General legal information, Commentary/secondary sources.
Never invent: Laws, Sections, Case names, Case citations, Court decisions, Legal deadlines, Penalties, Regulations, Legal authorities.
If you cannot verify a citation, explicitly state: "I don't have enough verified information to establish that" or "I would want to verify the current text/source before relying on this."

4. Legal Analysis Framework
When analyzing a legal issue, provide:
- Issue: What legal question is being considered?
- Relevant Law: The applicable legislation, rule, regulation, constitutional provision, or verified case law.
- Facts: Separate facts provided by the user from assumptions.
- Application: Explain how the stated facts may interact with the relevant law.
- Counterarguments / Alternatives: Significant alternative interpretations or arguments.
- Practical Next Steps: Gathering documents, checking deadlines, contacting authorities, consulting a qualified lawyer.
- Limitations: Missing facts or uncertainties that could change the analysis.

5. Document Analysis
For documents uploaded or pasted:
- Identify document type.
- Summarize in plain language.
- Extract Parties, Dates, Obligations, Rights, Deadlines, Monetary amounts, Termination provisions, Penalties, Dispute resolution clauses, Governing law, Jurisdiction clauses, Important conditions.
- Flag provisions deserving professional review.
- Explain unfamiliar terminology.
- Identify ambiguities or missing info.
- Never claim a document is legally valid or invalid unless supported by verified jurisdiction-specific authority.
- When reviewing contracts, do not silently rewrite user obligations.

6. Drafting Rules
- Use placeholders: [NAME], [DATE], [ADDRESS], [CASE NUMBER], [AMOUNT], etc.
- Do not invent factual allegations or evidence.
- Do not create fake citations.
- Clearly identify assumptions.
- Recommend review by a qualified lawyer before filing, signing, or sending.

7. High-Risk Legal Situations
For criminal charges/arrest, imminent court deadlines, deportation/immigration, domestic violence/safety, child custody, major financial liability, imminent eviction, detention, serious employment consequences:
- Flag as HIGH RISK immediately.
- Prioritize immediate practical safety steps and emergency legal aid/helplines.
- Do not delay urgent safety guidance.

8. No Fabrication
Never manufacture information. If facts are insufficient, state: "The answer may change depending on [specific missing fact]."

9. Privacy
Remind users not to submit sensitive identifiers (Aadhaar, SSN, passport, bank accounts, passwords). Minimize repetition of personal info.

10. Plain-Language Mode
Provide: Legal meaning, In simple words, Why it matters. Explain legal terms clearly.

11. Distinguish Information From Advice
Use: "Generally...", "Under the stated facts...", "This may depend on...", "A court may consider...", "The relevant provision appears to...".
Never say "You will definitely win" or "You don't need a lawyer".

12. Response Format
Structure substantive answers with: Short Answer, Relevant Law, Analysis, Important Considerations, Next Steps, Sources.

13. Contract Risk Review Categories
Categorize provisions as: Key obligation, Potential ambiguity, Financial exposure, Termination risk, Liability, Confidentiality, Intellectual property, Non-compete / restrictive covenant, Dispute resolution, Governing law, Data/privacy, Renewal, Notice requirements.
`;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasKey: Boolean(apiKey),
      model: 'gemini-3.8-flash',
      appName: 'LegalEase: AI',
    });
  });

  // 1. Legal Analysis / General Query
  app.post('/api/legal/analyze', async (req, res) => {
    try {
      const {
        query,
        jurisdiction = { country: 'General / International', state: '', courtOrAuthority: '', era: 'current' },
        facts = '',
        audienceLevel = 'Beginner',
        language = 'English',
        fileData,
      } = req.body;

      if (!query && !facts && !fileData) {
        return res.status(400).json({ error: 'Query, facts, or document is required.' });
      }

      const promptText = `
User Query / Legal Scenario:
${query || 'Analyze the provided facts/document.'}

Stated Facts:
${facts || 'See above query/document'}

Specified Jurisdiction Context:
- Country: ${jurisdiction.country || 'Not specified (assume general legal principles, flag jurisdiction need)'}
- State/Province: ${jurisdiction.state || 'Not specified'}
- Authority / Court: ${jurisdiction.courtOrAuthority || 'General / civil / commercial'}
- Law Era: ${jurisdiction.era || 'Current'}

Audience Accessibility Level: ${audienceLevel} (Adapt explanations accordingly)
Language: ${language}

Please analyze this legal issue adhering strictly to the LegalEase: AI framework.
Return a structured JSON response matching this schema:
{
  "shortAnswer": "Concise plain-language answer",
  "issue": "Specific legal question being considered",
  "relevantLaw": "Specific statutes, rules, constitutional provisions, or verified doctrines. Distinguish central vs state if India. Do NOT invent citations.",
  "factsSeparated": {
    "userStatedFacts": ["fact 1", "fact 2"],
    "assumptionsOrInferences": ["assumption 1"]
  },
  "application": "How stated facts interact with relevant law",
  "counterargumentsOrAlternatives": "Alternative interpretations or defenses",
  "importantConsiderations": ["Key consideration or uncertainty 1", "Key consideration 2"],
  "practicalNextSteps": ["Step 1", "Step 2", "Step 3"],
  "questionsToAskALawyer": ["Question 1 to ask when consulting a qualified lawyer", "Question 2"],
  "sources": ["Primary or authoritative source 1", "Secondary source 2"],
  "highRiskEvaluation": {
    "isHighRisk": false,
    "riskCategory": null,
    "urgentWarning": null
  },
  "unverifiedNotice": null
}
`;

      const parts: any[] = [];
      if (fileData && fileData.base64 && fileData.mimeType) {
        parts.push({
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.base64,
          },
        });
      }
      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction: MASTER_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.2, // low temperature for legal precision and no hallucinations
        },
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText);
        res.json(parsed);
      } catch (parseError) {
        res.json({
          shortAnswer: responseText,
          issue: query,
          relevantLaw: 'General legal principles',
          factsSeparated: { userStatedFacts: [facts], assumptionsOrInferences: [] },
          application: responseText,
          counterargumentsOrAlternatives: 'Consult qualified counsel for alternative strategies.',
          importantConsiderations: ['Please verify jurisdiction-specific statutes.'],
          practicalNextSteps: ['Gather original documentation', 'Consult a qualified local advocate/lawyer'],
          questionsToAskALawyer: ['Does this interpretation hold under current local precedent?'],
          sources: [],
          highRiskEvaluation: { isHighRisk: false, riskCategory: null, urgentWarning: null },
          unverifiedNotice: null,
        });
      }
    } catch (error: any) {
      console.error('Error in /api/legal/analyze:', error);
      res.status(500).json({ error: error?.message || 'Failed to complete legal analysis.' });
    }
  });

  // 2. Document & Contract Review
  app.post('/api/legal/document-review', async (req, res) => {
    try {
      const {
        documentText = '',
        fileData,
        documentTitle = 'Legal Document',
        jurisdiction = { country: 'General', state: '' },
      } = req.body;

      if (!documentText && !fileData) {
        return res.status(400).json({ error: 'Document text or file is required.' });
      }

      const promptText = `
Document Title / Identifier: ${documentTitle}
Jurisdiction Context: Country: ${jurisdiction.country || 'General'}, State: ${jurisdiction.state || 'General'}

Analyze this legal document thoroughly following the LegalEase: AI Document Analysis and Contract Risk Review standards.
Extract every key element and categorize notable clauses into the 13 defined categories (Key obligation, Potential ambiguity, Financial exposure, Termination risk, Liability, Confidentiality, Intellectual property, Non-compete / restrictive covenant, Dispute resolution, Governing law, Data/privacy, Renewal, Notice requirements).

Remember:
- Use neutral language. Flag provisions for review rather than declaring them unlawful without adequate legal support.
- Do not silently rewrite user obligations.
- Highlight missing clauses or ambiguities.

Return a JSON response matching this schema:
{
  "documentType": "e.g. Commercial Lease / Employment Agreement / Non-Disclosure Agreement / Legal Notice",
  "plainLanguageSummary": "A clear, plain-language summary of what this document does and its overall implications.",
  "extractedElements": {
    "parties": [
      { "name": "Party A", "role": "e.g. Landlord / Employer / Disclosing Party", "details": "..." }
    ],
    "dates": [
      { "date": "e.g. 2026-10-01", "context": "Effective Date", "isDeadline": false }
    ],
    "obligations": [
      { "party": "Party A", "obligation": "What they must do", "condition": "Optional condition" }
    ],
    "rights": [
      { "party": "Party B", "right": "What they are permitted to do" }
    ],
    "deadlines": [
      { "title": "Notice of termination", "timeframe": "30 days prior", "consequences": "Automatic renewal" }
    ],
    "monetaryAmounts": [
      { "amount": "$5,000 / ₹50,000", "purpose": "Security deposit", "dueOrCondition": "Payable upon execution" }
    ],
    "terminationProvisions": "Summary of how either party can terminate the agreement",
    "penalties": "Summary of default interest, liquidated damages, or punitive clauses",
    "disputeResolution": "Arbitration / Mediation / Court jurisdiction stipulations",
    "governingLaw": "Applicable governing law specified in the agreement",
    "importantConditions": ["Condition precedent 1", "Condition 2"]
  },
  "contractRiskReview": [
    {
      "category": "One of: Key obligation | Potential ambiguity | Financial exposure | Termination risk | Liability | Confidentiality | Intellectual property | Non-compete / restrictive covenant | Dispute resolution | Governing law | Data/privacy | Renewal | Notice requirements",
      "clauseSnippet": "Verbatim or close quotation from the document",
      "observation": "Neutral explanation of why this provision matters and potential pitfalls",
      "riskLevel": "low | moderate | high",
      "recommendationForLawyer": "Specific question or advice point to discuss with a lawyer"
    }
  ],
  "ambiguitiesAndMissingInfo": [
    "Identified ambiguity or missing clause (e.g. no force majeure, unclear cure period)"
  ],
  "glossaryOfTermsFound": [
    {
      "term": "Indemnity",
      "legalMeaning": "Contractual obligation to compensate for losses",
      "simpleWords": "A promise to pay if things go wrong and cause a financial hit",
      "whyItMatters": "Could expose you to unlimited third-party damages"
    }
  ],
  "overallVerdictNotice": "Informational observation: Reminder that enforceability requires verification by a qualified attorney in the relevant jurisdiction."
}
`;

      const parts: any[] = [];
      if (fileData && fileData.base64 && fileData.mimeType) {
        parts.push({
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.base64,
          },
        });
      }
      if (documentText) {
        parts.push({ text: `Document Text Content:\n${documentText}` });
      }
      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction: MASTER_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/legal/document-review:', error);
      res.status(500).json({ error: error?.message || 'Failed to review document.' });
    }
  });

  // 3. Legal Drafting Assistant
  app.post('/api/legal/draft', async (req, res) => {
    try {
      const {
        draftType, // e.g., 'Legal Notice', 'Consumer Complaint', 'Cease & Desist', 'Tenancy Notice', 'RTI Application', 'Simple Service Agreement', 'Formal Demand Letter'
        jurisdiction = { country: 'India', state: '' },
        senderInfo = '',
        recipientInfo = '',
        matterDescription = '',
        keyDemandsOrTerms = '',
        datesAndTimeline = '',
        additionalInstructions = '',
      } = req.body;

      if (!draftType || !matterDescription) {
        return res.status(400).json({ error: 'Draft type and description of the matter are required.' });
      }

      const promptText = `
Drafting Request:
- Document Type: ${draftType}
- Jurisdiction: Country: ${jurisdiction.country || 'Not specified'}, State: ${jurisdiction.state || 'Not specified'}
- Sender / Aggrieved Party: ${senderInfo || '[NAME / SENDER]'}
- Recipient / Opposing Party: ${recipientInfo || '[NAME / RECIPIENT]'}
- Facts & Matter Description: ${matterDescription}
- Specific Demands / Terms / Redressal Sought: ${keyDemandsOrTerms || 'Standard statutory remedies'}
- Timeline & Relevant Dates: ${datesAndTimeline || 'Not specified'}
- Additional Custom Instructions: ${additionalInstructions || 'None'}

Drafting Rules adherence:
1. Use brackets for placeholders: [NAME], [DATE], [ADDRESS], [CASE NUMBER], [AMOUNT], etc.
2. Do not invent factual allegations or fabricate evidence.
3. Do not create fake case citations.
4. Use clear, formal, professional legal language standard for ${jurisdiction.country || 'general common law'}.
5. Preserve user's intended meaning.
6. Clearly state assumptions made.
7. Include prominent disclaimer reminding the user that this document must be reviewed by a qualified advocate or attorney before sending, serving, or filing.

Return a JSON response matching this schema:
{
  "documentTitle": "Formal Title of the Document",
  "documentContent": "Full formatted text of the drafted document ready for copying or editing, with standard headers, reference numbers, recitals, numbered paragraphs, prayer/demand clauses, and signature blocks",
  "assumptionsMade": ["Assumption 1", "Assumption 2"],
  "missingFactsNeeded": ["Essential detail 1 user should fill into placeholders"],
  "recommendedLawyerChecklist": ["Verify statutory limitation period", "Verify service mode (Registered Post AD / Speed Post / Email)"],
  "serviceOrFilingGuidance": "Standard procedural guidelines on how this notice or document is typically delivered or filed in this jurisdiction"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
          systemInstruction: MASTER_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/legal/draft:', error);
      res.status(500).json({ error: error?.message || 'Failed to draft legal document.' });
    }
  });

  // 4. Case Timeline & Organizer
  app.post('/api/legal/organize-case', async (req, res) => {
    try {
      const {
        caseNarrative = '',
        documentsList = '',
        jurisdiction = { country: 'General' },
      } = req.body;

      if (!caseNarrative) {
        return res.status(400).json({ error: 'Case narrative or fact description is required.' });
      }

      const promptText = `
Case Information / Fact Narrative:
${caseNarrative}

Attached / Mentioned Documents:
${documentsList || 'None specified'}

Jurisdiction: ${jurisdiction.country || 'General'}

Organize this case information into a comprehensive structured briefing packet following LegalEase: AI framework:
1. Chronological Timeline of events with dates and legal significance.
2. Legal Issues identified.
3. Parties & their legal roles, claims, or exposure.
4. Evidence Matrix: Available evidence vs needed/missing evidence.
5. "Questions to ask your lawyer": High-impact, tailored questions to maximize an initial consultation with a qualified legal professional.

Return a JSON response matching this schema:
{
  "caseSummary": "Objective high-level summary of the matter",
  "timeline": [
    {
      "date": "Date or timeframe",
      "event": "What occurred",
      "significance": "Why this matters legally (e.g. triggers limitation period, establishes notice)",
      "evidenceRef": "Supporting document if mentioned"
    }
  ],
  "issues": [
    {
      "id": "ISSUE-1",
      "title": "Short title",
      "question": "What is the core legal question?",
      "relevantLegalArea": "e.g. Contract Law, Consumer Protection, Labor Law, Tenancy"
    }
  ],
  "parties": [
    {
      "name": "Party Name or Designation",
      "role": "Claimant / Respondent / Defendant / Witness",
      "positionOrExposure": "Their asserted position or potential exposure"
    }
  ],
  "evidenceMatrix": [
    {
      "item": "e.g. Email confirmation dated 14 March",
      "status": "available | needed | missing",
      "importance": "high | medium | low",
      "purpose": "Proves communication of defect to seller"
    }
  ],
  "questionsForLawyer": [
    {
      "category": "Limitation & Deadlines / Strategy / Costs / Jurisdiction",
      "question": "Clear, specific question to ask counsel",
      "rationale": "Why asking this will protect your interests"
    }
  ],
  "criticalDeadlinesNotice": "Reminder to check statutory limitation periods with counsel immediately."
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
          systemInstruction: MASTER_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/legal/organize-case:', error);
      res.status(500).json({ error: error?.message || 'Failed to organize case.' });
    }
  });

  // 5. Plain-Language Concept Explainer
  app.post('/api/legal/explain-concept', async (req, res) => {
    try {
      const {
        concept,
        jurisdiction = { country: 'General' },
        level = 'Beginner', // 'Beginner' | 'Student' | 'Professional' | 'Lawyer' | 'ELI10'
      } = req.body;

      if (!concept) {
        return res.status(400).json({ error: 'Concept name is required.' });
      }

      const promptText = `
Explain the legal concept: "${concept}"
Jurisdiction: ${jurisdiction.country || 'General Common Law / Global'}
Target Audience Level: ${level}

Adhere to the Plain-Language Mode:
- Provide:
  1. Legal meaning (precise technical definition)
  2. In simple words (digestible, accessible analogy)
  3. Why it matters (real-world practical consequences for individuals or businesses)
- Include a concrete, relatable scenario/example.
- Identify common misconceptions or myths.
- Reference relevant statutory doctrines or governing statutes if verified (DO NOT invent citations).

Return JSON matching:
{
  "concept": "${concept}",
  "legalMeaning": "Precise legal definition",
  "inSimpleWords": "Clear, plain-language translation",
  "whyItMatters": "Why an everyday person or business owner should care",
  "concreteExample": "A realistic scenario showing how this works",
  "commonMisconceptions": ["Misconception 1 vs Reality", "Misconception 2"],
  "relatedStatutesOrDoctrines": ["Doctrine or statute 1"],
  "proTipForConsultingLawyer": "A smart tip to bring up with an attorney"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
          systemInstruction: MASTER_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/legal/explain-concept:', error);
      res.status(500).json({ error: error?.message || 'Failed to explain concept.' });
    }
  });

  // 6. Interactive Conversational Assistant (Chat)
  app.post('/api/legal/chat', async (req, res) => {
    try {
      const {
        messages = [],
        jurisdiction = { country: 'General' },
        audienceLevel = 'Beginner',
        language = 'English',
        fileData,
      } = req.body;

      if (!messages || messages.length === 0) {
        return res.status(400).json({ error: 'Messages are required.' });
      }

      // Convert conversation history into Gemini format
      const contents: any[] = [];

      // Add context header to first user message or append system context
      const contextPrefix = `[Jurisdiction Context: Country: ${jurisdiction.country || 'General'}, State: ${jurisdiction.state || 'General'}. Audience: ${audienceLevel}. Language: ${language}]\n`;

      messages.forEach((msg: any, idx: number) => {
        const isLast = idx === messages.length - 1;
        const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';

        if (isLast && role === 'user' && fileData && fileData.base64 && fileData.mimeType) {
          contents.push({
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: fileData.mimeType,
                  data: fileData.base64,
                },
              },
              { text: (idx === 0 ? contextPrefix : '') + msg.content },
            ],
          });
        } else {
          contents.push({
            role,
            parts: [{ text: (idx === 0 && role === 'user' ? contextPrefix : '') + msg.content }],
          });
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: MASTER_SYSTEM_PROMPT,
          temperature: 0.3,
        },
      });

      const reply = response.text || 'I could not generate a response. Please check your query.';
      res.json({ reply });
    } catch (error: any) {
      console.error('Error in /api/legal/chat:', error);
      res.status(500).json({ error: error?.message || 'Failed to generate chat response.' });
    }
  });

  // Vite middleware in dev or static serving in prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LegalEase: AI Server active on port ${PORT}`);
  });
}

startServer();
