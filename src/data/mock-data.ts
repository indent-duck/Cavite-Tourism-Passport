import {
    AboutCaviteContent,
    Event,
    Expressway,
    FAQ,
    Itinerary,
    PromoPeriod,
    Reward,
    Settings,
    Site,
    Stamp,
    StampRequest,
    User
} from "./types";

// ============================================================================
// Mock User Configuration
// ============================================================================
// Toggle this flag to switch between locked and eligible states for design testing
const USE_ELIGIBLE_USER = false;

// Current user (as specified in requirements)
export const mockUser: User = {
  id: "user-001",
  email: "juan.delacruz@example.com",
  name: "Juan Dela Cruz",
  address: "Dasmariñas, Cavite",
  passportId: "CVT-2027-000123",
  points: 450,
  createdAt: new Date("2027-01-15"),
  // contactNumber is undefined initially - added later in Account screen
  contactVerified: false,
};

// Eligible user for testing (750 pts, stamps from all 4 categories)
const mockEligibleUser: User = {
  id: "user-001",
  email: "juan.delacruz@example.com",
  name: "Juan Dela Cruz",
  address: "Dasmariñas, Cavite",
  passportId: "CVT-2027-000123",
  points: 750,
  createdAt: new Date("2027-01-15"),
  // contactNumber is undefined initially - added later in Account screen
  contactVerified: false,
};

// Export the appropriate user based on flag (mutable for in-memory updates during UI-first phase)
export let currentMockUser = USE_ELIGIBLE_USER ? mockEligibleUser : mockUser;

// User's collected stamps
// Total: 450 points from 1 Dining (150), 1 Staycation (200), 2 Heritage (50 each)
// Missing: Adventure and Festival
export const mockStamps: Stamp[] = [
  {
    id: "stamp-001",
    userId: "user-001",
    siteId: "site-dining-001",
    siteName: "Café Amadeo",
    siteCategory: "Dining",
    municipality: "Amadeo",
    pointsEarned: 150,
    collectedAt: new Date("2027-02-10T14:30:00"),
  },
  {
    id: "stamp-002",
    userId: "user-001",
    siteId: "site-staycation-001",
    siteName: "Tagaytay Highlands Resort",
    siteCategory: "Staycation",
    municipality: "Tagaytay",
    pointsEarned: 200,
    collectedAt: new Date("2027-02-15T10:00:00"),
  },
  {
    id: "stamp-003",
    userId: "user-001",
    siteId: "site-heritage-001",
    siteName: "Aguinaldo Shrine",
    siteCategory: "Heritage",
    municipality: "Kawit",
    pointsEarned: 50,
    collectedAt: new Date("2027-02-20T11:15:00"),
  },
  {
    id: "stamp-004",
    userId: "user-001",
    siteId: "site-heritage-002",
    siteName: "Fort San Felipe",
    siteCategory: "Heritage",
    municipality: "Cavite City",
    pointsEarned: 50,
    collectedAt: new Date("2027-02-25T15:45:00"),
  },
];

// Additional stamps for eligible user testing (when USE_ELIGIBLE_USER = true)
const eligibleUserStamps: Stamp[] = [
  ...mockStamps,
  {
    id: "stamp-005",
    userId: "user-001",
    siteId: "site-adventure-001",
    siteName: "Mount Palay-Palay National Park",
    siteCategory: "Adventure",
    municipality: "Maragondon",
    pointsEarned: 100,
    collectedAt: new Date("2027-03-05T09:00:00"),
  },
  {
    id: "stamp-006",
    userId: "user-001",
    siteId: "site-staycation-002",
    siteName: "Canyon Cove Resort",
    siteCategory: "Staycation",
    municipality: "Nasugbu",
    pointsEarned: 200,
    collectedAt: new Date("2027-03-10T14:00:00"),
  },
];

// Export the appropriate stamps based on flag (mutable for in-memory updates during UI-first phase)
export let currentMockStamps = USE_ELIGIBLE_USER ? eligibleUserStamps : mockStamps;

// Site catalog (diverse set across all categories)
export const mockSites: Site[] = [
  // Dining category
  {
    id: "site-dining-001",
    name: "Café Amadeo",
    category: "Dining",
    municipality: "Amadeo",
    address: "Brgy. Dagatan, Amadeo, Cavite",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.1747,
    longitude: 120.9217,
    operatingHours: "7:00 AM - 9:00 PM",
  },
  {
    id: "site-dining-002",
    name: "Josephine Restaurant",
    category: "Dining",
    municipality: "Tagaytay",
    address: "Tagaytay-Nasugbu Highway, Tagaytay City",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.1093,
    longitude: 120.956,
    operatingHours: "10:00 AM - 10:00 PM",
  },
  {
    id: "site-dining-003",
    name: "Balay Dako",
    category: "Dining",
    municipality: "Tagaytay",
    address: "Tagaytay-Calamba Road, Tagaytay City",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.1124,
    longitude: 120.9442,
    operatingHours: "11:00 AM - 9:00 PM",
  },

  // Staycation category
  {
    id: "site-staycation-001",
    name: "Tagaytay Highlands Resort",
    category: "Staycation",
    municipality: "Tagaytay",
    address: "Tagaytay Highlands, Tagaytay City",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.1137,
    longitude: 120.939,
    operatingHours: "24 hours",
  },
  {
    id: "site-staycation-002",
    name: "Canyon Cove Resort",
    category: "Staycation",
    municipality: "Nasugbu",
    address: "Piloto Wawa, Nasugbu, Batangas (Cavite border)",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.0691,
    longitude: 120.6302,
    operatingHours: "24 hours",
  },
  {
    id: "site-staycation-003",
    name: "Taal Vista Hotel",
    category: "Staycation",
    municipality: "Tagaytay",
    address: "Km. 60 Aguinaldo Highway, Tagaytay City",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.1165,
    longitude: 120.9582,
    operatingHours: "24 hours",
  },

  // Adventure category
  {
    id: "site-adventure-001",
    name: "Mount Palay-Palay National Park",
    category: "Adventure",
    municipality: "Maragondon",
    address: "Maragondon, Cavite",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.2542,
    longitude: 120.7383,
    operatingHours: "6:00 AM - 6:00 PM",
  },
  {
    id: "site-adventure-002",
    name: "Corregidor Island",
    category: "Adventure",
    municipality: "Cavite City",
    address: "Corregidor Island, Manila Bay",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.3833,
    longitude: 120.5833,
    operatingHours: "8:00 AM - 5:00 PM",
  },
  {
    id: "site-adventure-003",
    name: "Pico de Loro",
    category: "Adventure",
    municipality: "Maragondon",
    address: "Mt. Palay-Palay, Maragondon, Cavite",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.1878,
    longitude: 120.6431,
    operatingHours: "5:00 AM - 5:00 PM",
  },

  // Heritage category
  {
    id: "site-heritage-001",
    name: "Aguinaldo Shrine",
    category: "Heritage",
    municipality: "Kawit",
    address: "Emilio Aguinaldo Highway, Kawit, Cavite",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.4444,
    longitude: 120.9028,
    operatingHours: "8:00 AM - 5:00 PM",
  },
  {
    id: "site-heritage-002",
    name: "Fort San Felipe",
    category: "Heritage",
    municipality: "Cavite City",
    address: "Cavite City, Cavite",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.4922,
    longitude: 120.904,
    operatingHours: "8:00 AM - 5:00 PM",
  },
  {
    id: "site-heritage-003",
    name: "Battle of Binakayan-Dalahican Monument",
    category: "Heritage",
    municipality: "Kawit",
    address: "Dalahican, Kawit, Cavite",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.438,
    longitude: 120.899,
    operatingHours: "Open 24 hours",
  },
  {
    id: "site-heritage-004",
    name: "Museo de La Salle",
    category: "Heritage",
    municipality: "Dasmariñas",
    address: "De La Salle University, Dasmariñas, Cavite",
    description: "Placeholder: awaiting Tourism Office content",
    latitude: 14.3294,
    longitude: 120.9367,
    operatingHours: "9:00 AM - 4:00 PM",
  },
];

// Itineraries
export const mockItineraries: Itinerary[] = [
  {
    id: "itin-001",
    title: "Heritage Trail",
    type: "Day Tour",
    description: "Explore historical landmarks of Cavite",
    duration: "8 hours",
    siteIds: [
      "site-heritage-001",
      "site-heritage-002",
      "site-heritage-003",
      "site-dining-001",
    ],
  },
  {
    id: "itin-002",
    title: "Tagaytay Escape",
    type: "Day Tour",
    description: "Scenic views and local cuisine",
    duration: "10 hours",
    siteIds: ["site-dining-002", "site-staycation-001", "site-adventure-001"],
  },
  {
    id: "itin-003",
    title: "Coastal Adventure",
    type: "Overnight Tour",
    description: "Beach resort and water activities",
    duration: "2 days",
    siteIds: [
      "site-staycation-002",
      "site-adventure-002",
      "site-dining-001",
      "site-heritage-001",
    ],
  },
  {
    id: "itin-004",
    title: "Complete Cavite Experience",
    type: "Overnight Tour",
    description: "Mix of heritage, nature, and relaxation",
    duration: "2 days",
    siteIds: [
      "site-heritage-001",
      "site-staycation-001",
      "site-adventure-001",
      "site-dining-002",
      "site-heritage-004",
    ],
  },
];

// Events
// Event dates are relative to now for testing status computation
export const mockEvents: Event[] = [
  // Happening now (started yesterday, ends tomorrow)
  {
    id: "event-001",
    title: "Sample Town Festival - Amadeo",
    startDate: new Date(Date.now() - 86400000).toISOString(), // Started yesterday
    endDate: new Date(Date.now() + 86400000).toISOString(), // Ends tomorrow
    time: "8:00 AM – 9:00 PM PST",
    venue: "Amadeo Municipal Plaza & Town Proper",
    municipality: "Amadeo",
    address: "A. Mabini St, Amadeo, Cavite",
    latitude: 14.1719,
    longitude: 120.9236,
    description: "Placeholder: awaiting Tourism Office content",
    category: "Festival",
    festivalStamp: {
      pointsBonus: 50,
      available: true,
    },
  },
  // Upcoming festival (~30 days from now)
  {
    id: "event-002",
    title: "Sample Town Festival - Maragondon",
    startDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    time: "9:00 AM – 8:00 PM PST",
    venue: "Maragondon Town Plaza",
    municipality: "Maragondon",
    address: "Maragondon Town Plaza, Maragondon, Cavite",
    latitude: 14.2675,
    longitude: 120.7361,
    description: "Placeholder: awaiting Tourism Office content",
    category: "Festival",
    festivalStamp: {
      pointsBonus: 50,
      available: true,
    },
  },
  // Upcoming festival (~60 days from now, multi-day)
  {
    id: "event-003",
    title: "Sample Town Festival - Cavite City",
    startDate: new Date(Date.now() + 86400000 * 60).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 62).toISOString(), // 3-day event
    time: "7:00 AM – 10:00 PM PST",
    venue: "Plaza Soledad",
    municipality: "Cavite City",
    address: "Plaza Soledad, Cavite City, Cavite",
    latitude: 14.4791,
    longitude: 120.8973,
    description: "Placeholder: awaiting Tourism Office content",
    category: "Festival",
    festivalStamp: {
      pointsBonus: 50,
      available: true,
    },
  },
  // Upcoming festival (~90 days from now)
  {
    id: "event-004",
    title: "Sample Town Festival - Kawit",
    startDate: new Date(Date.now() + 86400000 * 90).toISOString(),
    time: "8:00 AM – 9:00 PM PST",
    venue: "Emilio Aguinaldo Shrine",
    municipality: "Kawit",
    address: "Emilio Aguinaldo Shrine, Kawit, Cavite",
    latitude: 14.4444,
    longitude: 120.9028,
    description: "Placeholder: awaiting Tourism Office content",
    category: "Festival",
  },
  // Upcoming cultural event (~120 days from now)
  {
    id: "event-005",
    title: "Sample Cultural Event - General Trias",
    startDate: new Date(Date.now() + 86400000 * 120).toISOString(),
    time: "10:00 AM – 6:00 PM PST",
    venue: "General Trias City Hall",
    municipality: "General Trias",
    address: "General Trias City Hall, General Trias, Cavite",
    latitude: 14.3859,
    longitude: 120.8812,
    description: "Placeholder: awaiting Tourism Office content",
    category: "Cultural",
  },
  // Upcoming cultural event (~150 days from now)
  {
    id: "event-006",
    title: "Sample Cultural Event - Tagaytay City",
    startDate: new Date(Date.now() + 86400000 * 150).toISOString(),
    time: "9:00 AM – 5:00 PM PST",
    venue: "People's Park in the Sky",
    municipality: "Tagaytay City",
    address: "People's Park in the Sky, Tagaytay City, Cavite",
    latitude: 14.1095,
    longitude: 120.9745,
    description: "Placeholder: awaiting Tourism Office content",
    category: "Cultural",
  },
];

// Expressways
// locationSpan and length are TBD - pending Tourism Office confirmation
export const mockExpressways: Expressway[] = [
  {
    id: "expressway-001",
    name: "CAVITEX",
    locationSpan: "Parañaque – Kawit",
    length: "14 km",
    description: "Placeholder: awaiting Tourism Office content",
  },
  {
    id: "expressway-002",
    name: "CAVITEX C5 Link",
    locationSpan: "Taguig – Las Piñas",
    length: "7.7 km",
    description: "Placeholder: awaiting Tourism Office content",
  },
  {
    id: "expressway-003",
    name: "CALAX",
    locationSpan: "Kawit – Biñan, Laguna",
    length: "45 km",
    description: "Placeholder: awaiting Tourism Office content",
  },
];

// About Cavite content
export const mockAboutCavite: AboutCaviteContent = {
  sections: [
    {
      heading: "Historical and Topographical Riches",
      content: "Placeholder: awaiting Tourism Office content",
    },
    {
      heading: "Culinary Delights",
      content: "Placeholder: awaiting Tourism Office content",
    },
    {
      heading: "Cultural Immersions",
      content: "Placeholder: awaiting Tourism Office content",
    },
  ],
};

// Rewards catalog
// Note: Juan has 450 pts with stamps from Dining, Staycation, and Heritage only (missing Adventure).
// He is NOT eligible for any reward (needs at least 700 pts AND stamps from all 4 main categories).
// For design testing of eligible state, temporarily modify mockUser.points to 750+ and add an Adventure stamp.
export const mockRewards: Reward[] = [
  // Locked state: User has 450 pts, needs 700 minimum
  {
    id: "reward-001",
    title: "Cavite Heritage Book Collection",
    description: "Set of 3 books about Cavite history and culture",
    pointsCost: 700,
    imageUrl: "https://picsum.photos/seed/reward1/400/300",
    available: true,
    limited: false,
  },
  // Locked state: Higher point cost
  {
    id: "reward-002",
    title: "Tagaytay Weekend Staycation",
    description: "2-day resort accommodation with breakfast for 2",
    pointsCost: 1200,
    imageUrl: "https://picsum.photos/seed/reward2/400/300",
    available: true,
    limited: true,
    remainingClaims: 15,
  },
  // Locked state
  {
    id: "reward-003",
    title: "Cavite Culinary Tour Voucher",
    description: "Guided food tour for 2 people visiting 5 local restaurants",
    pointsCost: 900,
    imageUrl: "https://picsum.photos/seed/reward3/400/300",
    available: true,
    limited: true,
    remainingClaims: 8,
  },
  // Locked state
  {
    id: "reward-004",
    title: "Official Cavite Tourism T-Shirt",
    description: "Limited edition commemorative shirt (Size: S-XXL)",
    pointsCost: 700,
    imageUrl: "https://picsum.photos/seed/reward4/400/300",
    available: true,
    limited: false,
  },
  // Locked state
  {
    id: "reward-005",
    title: "Adventure Package: Pico de Loro Trek",
    description: "Guided mountain trek with lunch and transportation",
    pointsCost: 1000,
    imageUrl: "https://picsum.photos/seed/reward5/400/300",
    available: true,
    limited: true,
    remainingClaims: 20,
  },
  // No longer available (sold out)
  {
    id: "reward-006",
    title: "Cavite Arts & Crafts Bundle",
    description: "Collection of locally-made handicrafts and souvenirs",
    pointsCost: 800,
    imageUrl: "https://picsum.photos/seed/reward6/400/300",
    available: false,
    limited: true,
    remainingClaims: 0,
  },
  // Already claimed (for testing claimed state)
  {
    id: "reward-007",
    title: "Cavite Photo Frame Set",
    description: "Set of 5 wooden frames featuring Cavite landmarks",
    pointsCost: 750,
    imageUrl: "https://picsum.photos/seed/reward7/400/300",
    available: true,
    limited: false,
    claimedByUser: true,
    claimedAt: new Date("2027-02-28T10:00:00"),
  },
];

// Promo period
// Relative to today (like mockEvents) so date-bound features, e.g. the visit
// date of a stamp request, always have a valid range to pick from
const DAY_MS = 86400000;
const today = new Date();
today.setHours(0, 0, 0, 0);

export const mockPromoPeriod: PromoPeriod = {
  startDate: new Date(today.getTime() - DAY_MS * 45),
  endDate: new Date(today.getTime() + DAY_MS * 45),
  active: true,
};

// ============================================================================
// Stamp Requests
// ============================================================================

// Physical-stamp requests sent for admin review (in-memory, starts empty;
// approve/reject them from the dev panel on the Stamp requests screen)
export const currentMockStampRequests: StampRequest[] = [];

// ============================================================================
// Settings
// ============================================================================

// ============================================================================
// Active Claims Storage
// ============================================================================

// In-memory storage for active claim QRs (key is rewardId)
export const mockActiveClaims = new Map<string, import("./types").ActiveClaim>();

// ============================================================================
// Settings
// ============================================================================

// User settings (default: push notifications enabled)
export let mockSettings: Settings = {
  pushNotificationsEnabled: true,
};

/**
 * Helper function to update mockSettings
 * Uses spread syntax to create a new object and reassign the export
 */
export function updateMockSettings(settings: Partial<Settings>): Settings {
  mockSettings = { ...mockSettings, ...settings };
  return mockSettings;
}

// ============================================================================
// FAQs (Frequently Asked Questions)
// ============================================================================

export const mockFaqs: FAQ[] = [
  {
    id: "faq-1",
    question: "How do I collect stamps with the QR scanner?",
    answer:
      "Point camera at the official partner QR at the site counter/entrance while location is enabled. The app validates the stamp coordinates and securely logs your digital passport stamp badge immediately.",
    icon: "qr-code-outline",
  },
  {
    id: "faq-2",
    question: "How do points and rewards redemption work?",
    answer:
      "Each category earns points per stamp: Dining 150, Staycation 200, Adventure 100, Heritage 50, and Festival 50 (bonus only). To redeem rewards, you need at least 700 points AND at least one stamp from each of Dining, Staycation, Adventure, and Heritage. You can claim one prize per promo period at the Cavite Tourism Office.",
    icon: "gift-outline",
  },
  {
    id: "faq-3",
    question: "Can I scan a site QR code more than once?",
    answer:
      "Each site QR grants points once per active promotional season. Returning visits during the same promo period will not earn additional points, but you can collect stamps again in the next promo period.",
    icon: "sync-outline",
  },
  {
    id: "faq-4",
    question: "What should I do if the scanner cannot verify my location?",
    answer:
      "Ensure GPS is set to High Accuracy and camera permissions are granted. If you are indoors or in mountain areas with weak GPS, step outside near the entrance checkpoint or connect to the venue's Wi-Fi network.",
    icon: "location-outline",
  },
];
