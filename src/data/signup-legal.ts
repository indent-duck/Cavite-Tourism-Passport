/**
 * Signup Legal Summary - Cavite Tourism Passport
 *
 * Short Terms of Service and Privacy Policy shown in the sheet on sign up
 * step 1. The full policy lives on the Privacy & Terms screen (/privacy).
 *
 * Placeholder text pending Tourism Office and legal review.
 */

export type LegalDocId = 'terms' | 'privacy';

export interface LegalSection {
  title: string;
  body: string;
  bullets?: string[];
}

export interface LegalDoc {
  title: string;
  summary: string;
  sections: LegalSection[];
}

export const LEGAL_EFFECTIVE_DATE = 'Effective Jan 1, 2027 · v2.4';

export const SIGNUP_LEGAL: Record<LegalDocId, LegalDoc> = {
  terms: {
    title: 'Terms of Service',
    summary:
      'These terms cover how you may use the Cavite Tourism Passport, an official program of the Provincial Tourism & Cultural Affairs Office of Cavite.',
    sections: [
      {
        title: 'Your passport account',
        body: 'Each traveler may hold one passport account. You agree to:',
        bullets: [
          'Give accurate details when you register',
          'Keep your password private and not share your account',
          'Tell us right away if you think someone else has accessed your account',
        ],
      },
      {
        title: 'Collecting stamps',
        body: 'Stamps are collected by scanning a partner site QR code while you are physically there. Location services must be on, and your location is checked once per scan, within about 150 m of the site.',
      },
      {
        title: 'Points and rewards',
        body: 'Points earned from stamps can be redeemed for rewards while stock lasts. The current campaign runs through March 31, 2027, and points reset when a new period begins.',
        bullets: [
          'Reward claim codes are single use and expire after 15 minutes',
          'Only one claim code can be active at a time',
          'Rewards have no cash value and cannot be transferred',
        ],
      },
      {
        title: 'Fair play',
        body: 'Using mock GPS, emulators, modified apps, or another person’s account to collect stamps or claim rewards will lead to permanent revocation of your passport and forfeiture of your points.',
      },
      {
        title: 'Changes to these terms',
        body: 'We may update these terms as the program changes. If the changes are significant, we will notify you in the app and ask you to accept them before you continue.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    summary:
      'We collect only what we need to issue your digital passport, in line with Republic Act No. 10173 (Data Privacy Act of 2012).',
    sections: [
      {
        title: 'What we collect',
        body: 'When you sign up and use the app, we collect:',
        bullets: [
          'Your name, email address, and city or municipality',
          'Your issued passport ID (e.g., CVT-2027-xxxxxx)',
          'The stamps you collect, points you earn, and rewards you claim',
        ],
      },
      {
        title: 'Location',
        body: 'We read your location only at the moment you scan a site QR code, to confirm you are there. Your location is never tracked in the background, and coordinates are discarded right after the stamp is verified.',
      },
      {
        title: 'How we use it',
        body: 'Your information is used to run your passport, validate stamps, process rewards, and send you account updates. Visit statistics are anonymized before being used for provincial tourism planning.',
      },
      {
        title: 'Who we share it with',
        body: 'Partner sites see only what is needed to verify your visit or reward claim. We never sell or rent your personal information to advertisers or other third parties.',
      },
      {
        title: 'Your rights',
        body: 'You can view, correct, or delete your data at any time. Records are purged after 36 months of inactivity, or within 7 business days of a deletion request.',
      },
      {
        title: 'Contact us',
        body: 'Reach the Data Protection Officer at privacy@tourism.cavite.gov.ph or call (046) 419-1997.',
      },
    ],
  },
};
