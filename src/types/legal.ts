export type AudienceLevel = 'Beginner' | 'Student' | 'Professional' | 'Lawyer' | 'ELI10';

export interface Jurisdiction {
  country: string;
  state?: string;
  courtOrAuthority?: string;
  era?: string;
}

export interface LegalAnalysisResult {
  shortAnswer: string;
  issue: string;
  relevantLaw: string;
  factsSeparated: {
    userStatedFacts: string[];
    assumptionsOrInferences: string[];
  };
  application: string;
  counterargumentsOrAlternatives: string;
  importantConsiderations: string[];
  practicalNextSteps: string[];
  questionsToAskALawyer: string[];
  sources: string[];
  highRiskEvaluation?: {
    isHighRisk: boolean;
    riskCategory?: string | null;
    urgentWarning?: string | null;
  };
  unverifiedNotice?: string | null;
}

export type RiskCategory =
  | 'Key obligation'
  | 'Potential ambiguity'
  | 'Financial exposure'
  | 'Termination risk'
  | 'Liability'
  | 'Confidentiality'
  | 'Intellectual property'
  | 'Non-compete / restrictive covenant'
  | 'Dispute resolution'
  | 'Governing law'
  | 'Data/privacy'
  | 'Renewal'
  | 'Notice requirements';

export interface ContractRiskItem {
  category: RiskCategory;
  clauseSnippet: string;
  observation: string;
  riskLevel: 'low' | 'moderate' | 'high';
  recommendationForLawyer: string;
}

export interface ExtractedParty {
  name: string;
  role: string;
  details?: string;
}

export interface ExtractedDate {
  date: string;
  context: string;
  isDeadline: boolean;
}

export interface ExtractedObligation {
  party: string;
  obligation: string;
  condition?: string;
}

export interface ExtractedRight {
  party: string;
  right: string;
}

export interface ExtractedDeadline {
  title: string;
  timeframe: string;
  consequences?: string;
}

export interface ExtractedMonetaryAmount {
  amount: string;
  purpose: string;
  dueOrCondition?: string;
}

export interface GlossaryTerm {
  term: string;
  legalMeaning: string;
  simpleWords: string;
  whyItMatters: string;
}

export interface DocumentReviewResult {
  documentType: string;
  plainLanguageSummary: string;
  extractedElements: {
    parties: ExtractedParty[];
    dates: ExtractedDate[];
    obligations: ExtractedObligation[];
    rights: ExtractedRight[];
    deadlines: ExtractedDeadline[];
    monetaryAmounts: ExtractedMonetaryAmount[];
    terminationProvisions: string;
    penalties: string;
    disputeResolution: string;
    governingLaw: string;
    importantConditions: string[];
  };
  contractRiskReview: ContractRiskItem[];
  ambiguitiesAndMissingInfo: string[];
  glossaryOfTermsFound: GlossaryTerm[];
  overallVerdictNotice: string;
}

export interface DraftResult {
  documentTitle: string;
  documentContent: string;
  assumptionsMade: string[];
  missingFactsNeeded: string[];
  recommendedLawyerChecklist: string[];
  serviceOrFilingGuidance: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  significance: string;
  evidenceRef?: string;
}

export interface CaseIssue {
  id: string;
  title: string;
  question: string;
  relevantLegalArea: string;
}

export interface CaseParty {
  name: string;
  role: string;
  positionOrExposure: string;
}

export interface EvidenceItem {
  item: string;
  status: 'available' | 'needed' | 'missing';
  importance: 'high' | 'medium' | 'low';
  purpose: string;
}

export interface QuestionForLawyer {
  category: string;
  question: string;
  rationale: string;
}

export interface CaseOrganizationResult {
  caseSummary: string;
  timeline: TimelineEvent[];
  issues: CaseIssue[];
  parties: CaseParty[];
  evidenceMatrix: EvidenceItem[];
  questionsForLawyer: QuestionForLawyer[];
  criticalDeadlinesNotice: string;
}

export interface ConceptExplanationResult {
  concept: string;
  legalMeaning: string;
  inSimpleWords: string;
  whyItMatters: string;
  concreteExample: string;
  commonMisconceptions: string[];
  relatedStatutesOrDoctrines: string[];
  proTipForConsultingLawyer: string;
}
