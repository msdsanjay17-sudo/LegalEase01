/**
 * Privacy Shield Utility
 * Scrubs sensitive personal identification numbers (Aadhaar, SSN, PAN, Card, Bank, Phone, Email)
 * to adhere strictly to Section 9 (Privacy) of LegalEase: AI Master System Prompt.
 */

export interface RedactionResult {
  cleanedText: string;
  count: number;
  details: {
    aadhaarCount: number;
    ssnCount: number;
    panCount: number;
    cardCount: number;
    phoneCount: number;
    emailCount: number;
  };
}

export function sanitizeLegalText(input: string): RedactionResult {
  let cleaned = input;
  let aadhaarCount = 0;
  let ssnCount = 0;
  let panCount = 0;
  let cardCount = 0;
  let phoneCount = 0;
  let emailCount = 0;

  // 1. Aadhaar: 12 digits (with optional spaces or dashes)
  cleaned = cleaned.replace(/\b[2-9]{1}[0-9]{3}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b/g, () => {
    aadhaarCount++;
    return '[AADHAAR-REDACTED]';
  });

  // 2. US Social Security Number: 3-2-4 digits
  cleaned = cleaned.replace(/\b(?!000|666)[0-8][0-9]{2}[\s-]?(?!00)[0-9]{2}[\s-]?(?!0000)[0-9]{4}\b/g, () => {
    ssnCount++;
    return '[SSN-REDACTED]';
  });

  // 3. Indian PAN: 5 letters, 4 digits, 1 letter
  cleaned = cleaned.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi, () => {
    panCount++;
    return '[PAN-REDACTED]';
  });

  // 4. Credit / Debit card: 13 to 19 digits with separators
  cleaned = cleaned.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, () => {
    cardCount++;
    return '[CARD-REDACTED]';
  });

  // 5. Email addresses
  cleaned = cleaned.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, () => {
    emailCount++;
    return '[EMAIL-REDACTED]';
  });

  // 6. Phone numbers (10 to 12 digits with optional + country code)
  cleaned = cleaned.replace(/\b(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/g, () => {
    phoneCount++;
    return '[PHONE-REDACTED]';
  });

  const total = aadhaarCount + ssnCount + panCount + cardCount + phoneCount + emailCount;

  return {
    cleanedText: cleaned,
    count: total,
    details: {
      aadhaarCount,
      ssnCount,
      panCount,
      cardCount,
      phoneCount,
      emailCount,
    },
  };
}
