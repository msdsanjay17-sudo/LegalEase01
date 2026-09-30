export interface LegalConceptItem {
  name: string;
  category: string;
  shortSummary: string;
}

export const CURATED_CONCEPTS: LegalConceptItem[] = [
  { name: 'Indemnity', category: 'Contract Law', shortSummary: 'A promise to compensate another party for specified loss or damage.' },
  { name: 'Force Majeure', category: 'Contract Law', shortSummary: 'Unforeseeable circumstances that prevent someone from fulfilling a contract.' },
  { name: 'Liquidated Damages', category: 'Contract Law', shortSummary: 'Predetermined damages agreed upon by parties during contract formation.' },
  { name: 'Limitation Period', category: 'Civil Procedure', shortSummary: 'Statutory deadline after which a legal claim can no longer be filed.' },
  { name: 'Res Judicata', category: 'Civil Procedure', shortSummary: 'A matter that has been adjudicated by a competent court and cannot be relitigated.' },
  { name: 'Bail & Anticipatory Bail', category: 'Criminal Law', shortSummary: 'Provisional release of an accused person or protection against imminent arrest.' },
  { name: 'Caveat Emptor', category: 'Commercial Law', shortSummary: '"Let the buyer beware"—the buyer assumes the risk regarding product quality.' },
  { name: 'Specific Performance', category: 'Contract Law', shortSummary: 'Court order compelling a party to execute the exact contract terms.' },
  { name: 'Subrogation', category: 'Insurance Law', shortSummary: 'Legal right of an insurer to pursue a third party that caused an insurance loss.' },
  { name: 'Promissory Estoppel', category: 'Contract Law', shortSummary: 'Preventing a party from going back on a promise that another reasonably relied on.' },
  { name: 'Tortious Interference', category: 'Tort Law', shortSummary: 'Intentional damaging of someone else’s contractual or business relationships.' },
  { name: 'Piercing Corporate Veil', category: 'Corporate Law', shortSummary: 'Holding company shareholders or directors personally liable for company actions.' },
  { name: 'Adverse Possession', category: 'Property Law', shortSummary: 'Acquiring legal ownership of land through continuous, uninterrupted possession.' },
  { name: 'Locus Standi', category: 'Constitutional Law', shortSummary: 'The legal right or capacity of an individual to bring an action before a court.' },
  { name: 'Habeas Corpus', category: 'Constitutional Law', shortSummary: 'A writ requiring a detained person to be brought before a court to determine detention legality.' },
  { name: 'Severability Clause', category: 'Contract Law', shortSummary: 'Stipulates that remaining contract terms remain valid if one is declared illegal.' },
  { name: 'Arbitration Clause', category: 'Dispute Resolution', shortSummary: 'Agreement that disputes will be settled outside courts by an independent arbitrator.' },
  { name: 'Restrictive Covenant / Non-Compete', category: 'Employment Law', shortSummary: 'A clause barring an employee from competing or working for a rival after departure.' },
  { name: 'Doctrine of Frustration', category: 'Contract Law', shortSummary: 'Termination of a contract when unforeseen events make performance physically or commercially impossible.' },
  { name: 'Defamation (Libel vs Slander)', category: 'Tort & Criminal Law', shortSummary: 'False statement causing harm to reputation, either written (libel) or spoken (slander).' },
];

export const SAMPLE_DOCUMENTS = {
  leaseAgreement: `RESIDENTIAL LEASE AGREEMENT

This Agreement is made on 1st October 2026, between:
LANDLORD: Mr. Rajesh Sharma, residing at Flat 402, Green Valley Apartments, Mumbai, Maharashtra.
TENANT: Ms. Priya Deshmukh, residing at 12/B Baker Street, Pune, Maharashtra.

1. PREMISES: The Landlord leases to the Tenant Residential Apartment No. 301, Silver Heights, Andheri West, Mumbai.
2. TERM: The tenancy shall be for a fixed term of 11 months commencing from 1st November 2026 to 30th September 2027.
3. RENT & SECURITY DEPOSIT:
   a) The Tenant agrees to pay a monthly rent of INR 45,000, payable in advance on or before the 5th day of every calendar month.
   b) A refundable interest-free security deposit of INR 1,50,000 has been paid by the Tenant upon signing.
4. LATE PENALTY: Any rent delayed beyond the 5th of the month shall incur a compounding default penalty of 18% per annum calculated daily.
5. TERMINATION & LOCK-IN:
   a) Both parties are bound by a 6-month lock-in period. If Tenant vacates during the lock-in period, the full remaining rent for the period is forfeited.
   b) After the lock-in period, either party may terminate by giving 1 (one) calendar month's written notice.
   c) If Tenant fails to vacate upon expiry, Tenant shall pay damages at INR 3,000 per day until possession is delivered.
6. RESTRICTIONS:
   a) The Tenant shall not sublet or assign the premises without express written permission.
   b) No commercial activity or pets are permitted without prior consent.
7. INDEMNITY: The Tenant agrees to unconditionally indemnify and hold harmless the Landlord against any and all claims, damages, liabilities, or municipal penalties arising from the Tenant's occupation.
8. GOVERNING LAW & JURISDICTION: This agreement is governed by the laws of Maharashtra, India. In the event of any dispute, the Courts in Mumbai shall have exclusive jurisdiction.`,

  consumerDispute: `FACT SCENARIO - DEFECTIVE LAPTOP & REFUSAL OF WARRANTY

On 12th August 2026, I purchased a professional laptop (Model Apex Pro 16) from "TechKart Electronics Pvt Ltd" for INR 1,28,000 via their online store. The invoice explicitly promised a 2-year manufacturer comprehensive on-site warranty.

Within 18 days of purchase (30th August 2026), the laptop's motherboard failed completely—it refuses to power on. I immediately logged a service ticket with TechKart and the manufacturer "Zenith Computing India".

A service technician visited on 5th September 2026, inspected the device, acknowledged internal component failure, and took the laptop to the authorized service center.

On 18th September 2026, the service center emailed stating that warranty is denied due to alleged "customer liquid damage", despite the fact that no liquid was ever spilled on the device. They quoted INR 54,000 for replacement. I requested the technical diagnostic report with photos, but they have refused to provide any evidence or return the device without a diagnostic fee.

I sent multiple follow-up emails to their grievance officer on 22nd and 28th September 2026, but received only generic automated replies. The laptop is still in their custody and I am unable to conduct my architectural work.`,

  serviceAgreement: `FREELANCE SOFTWARE & DESIGN SERVICES AGREEMENT

Dated: 15th September 2026
Between:
Client: Nexus Retail Solutions Inc. (Delaware, USA)
Consultant: Elena Rostova (Independent Contractor)

1. SCOPE OF SERVICES: Consultant shall design and deliver a responsive e-commerce web platform per the milestone specifications outlined in Schedule A.
2. COMPENSATION: Fixed project fee of USD 12,500. Payment breakdown: 30% upfront, 40% upon beta deployment, 30% upon final acceptance testing.
3. INTELLECTUAL PROPERTY:
   a) All intellectual property rights, including source code, UI components, designs, and patentable concepts developed by Consultant shall immediately and irrevocably become the exclusive "work made for hire" property of Client upon creation.
   b) Consultant waives all moral rights worldwide in perpetuity.
4. NON-COMPETE & RESTRICTIVE COVENANTS:
   During the term and for a period of 24 (twenty-four) months following termination, Consultant shall not, directly or indirectly, engage with, consult for, or provide similar design/software development services to any entity in the digital retail or e-commerce sector globally.
5. LIMITATION OF LIABILITY:
   In no event shall Client be liable for any consequential or indirect damages. Consultant's liability under this agreement is unlimited.
6. GOVERNING LAW & DISPUTE RESOLUTION:
   This Agreement shall be governed by Delaware law. Any dispute shall be resolved through binding arbitration administered by JAMS in Wilmington, Delaware. Each party shall bear its own legal fees.`
};
