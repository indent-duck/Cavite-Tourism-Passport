/**
 * Legal Content - Cavite Tourism Passport
 * 
 * Placeholder text pending Tourism Office and legal review.
 * 
 * This file contains the Privacy Policy and Terms of Service content
 * displayed in the Privacy screen. All content is subject to review
 * and approval by the Provincial Tourism Office and legal counsel.
 */

export interface LegalContent {
  introduction: string;
  informationWeCollect: string;
  howWeUseYourInformation: string;
  dataSharingAndDisclosure: string;
  yourRights: string;
  security: string;
  changesToThisPolicy: string;
  contactUs: string;
  lastUpdated: string;
}

export const legalContent: LegalContent = {
  introduction: `The Cavite Tourism Passport mobile application ("App") is operated by the Provincial Tourism Office of Cavite ("we," "us," or "our"). This Privacy Policy and Terms of Service ("Policy") explains how we collect, use, disclose, and safeguard your information when you use our App. By creating an account and using the App, you agree to the collection and use of information in accordance with this Policy.`,

  informationWeCollect: `We collect several types of information from and about users of our App:

**Personal Information:** When you register for an account, we collect your full name, email address, residential address, and passport ID number.

**Location Data:** We collect precise location data from your mobile device when you scan QR codes at partner tourism sites to verify you are physically present at the location. This data is used solely for stamp validation purposes.

**Stamp and Activity Data:** We collect information about the sites you visit, stamps you collect, points you earn, and rewards you redeem. This includes timestamps, site names, and categories (Dining, Staycation, Adventure, Heritage, Festival).

**Device Information:** We may collect information about your mobile device, including device type, operating system version, unique device identifiers, and mobile network information.`,

  howWeUseYourInformation: `We use the information we collect for the following purposes:

**Account Management:** To create and manage your tourism passport account, verify your identity, and provide customer support.

**Stamp Validation:** To verify your physical presence at partner tourism sites using location data and QR code scanning, ensuring stamps are collected legitimately.

**Points and Rewards:** To calculate points earned, track your progress toward reward eligibility, generate claim QR codes, and process reward redemptions.

**Service Improvement:** To analyze usage patterns, improve App features, and enhance the overall tourism experience in Cavite.

**Communications:** To send you important notifications about your account, stamp collections, reward eligibility, and promotional period updates.

**Compliance:** To comply with legal obligations, enforce our terms of service, and protect the rights and safety of our users and partners.`,

  dataSharingAndDisclosure: `We may share your information in the following circumstances:

**Tourism Partners:** We share limited information (site visit timestamps, stamp collection data) with our partner tourism sites and establishments for verification and program administration purposes. We do not share your personal contact information with partners.

**Provincial Government:** Your tourism passport data may be shared with the Provincial Tourism Office and relevant government agencies for tourism planning, statistics, and program evaluation.

**Service Providers:** We may share information with third-party service providers who perform services on our behalf, such as cloud hosting, data analytics, and email and push notification delivery. These providers are contractually obligated to protect your information.

**Legal Requirements:** We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., court orders, government agencies).

**Business Transfers:** In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.

We do not sell, rent, or trade your personal information to third parties for marketing purposes.`,

  yourRights: `You have the following rights regarding your personal information:

**Access:** You may access and review your account information and passport data at any time through the Account screen in the App.

**Correction:** You may request corrections to your personal information by contacting us at the email address below. Some information (such as your passport ID) cannot be changed after account creation.

**Deletion:** You may request deletion of your account and associated data by contacting the Provincial Tourism Office. Note that some data may be retained for legal or administrative purposes even after deletion.

**Withdrawal of Consent:** You may withdraw consent for location tracking or push notifications through your device settings or the App's Settings screen. However, withdrawing location consent will prevent you from collecting stamps.

**Data Portability:** You may request a copy of your tourism passport data in a portable format.

To exercise these rights, please contact us using the information provided in the Contact Us section.`,

  security: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:

- Encryption of data in transit and at rest
- Secure authentication and password protection
- Regular security audits and vulnerability assessments
- Access controls and staff training on data protection
- Secure QR code generation and single-use claim codes

However, no method of electronic storage or transmission over the internet is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security. You are responsible for maintaining the confidentiality of your account password.`,

  changesToThisPolicy: `We may update this Privacy Policy and Terms of Service from time to time to reflect changes in our practices, legal requirements, or App features. We will notify you of any material changes by:

- Posting the updated Policy in the App with a new "Last Updated" date
- Sending an in-app notification or email to your registered email address
- Requiring you to review and accept the updated Policy before continuing to use the App

Your continued use of the App after the updated Policy becomes effective constitutes your acceptance of the changes. We encourage you to review this Policy periodically.`,

  contactUs: `If you have questions, concerns, or requests regarding this Privacy Policy, your personal information, or the Cavite Tourism Passport program, please contact us:

**Provincial Tourism Office of Cavite**
Email: tourism@cavite.gov.ph
Phone: (046) 481-5010
Address: Provincial Capitol Compound, Trece Martires City, Cavite

For technical support with the App, you may also use the Help & FAQs section in the Settings screen.`,

  lastUpdated: 'January 1, 2027',
};
