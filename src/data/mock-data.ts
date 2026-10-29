import {
    Event,
    Itinerary,
    PromoPeriod,
    Reward,
    Site,
    Stamp,
    User,
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

// Export the appropriate user based on flag
export const currentMockUser = USE_ELIGIBLE_USER ? mockEligibleUser : mockUser;

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

// Export the appropriate stamps based on flag
export const currentMockStamps = USE_ELIGIBLE_USER ? eligibleUserStamps : mockStamps;

// Site catalog (diverse set across all categories)
export const mockSites: Site[] = [
  // Dining category
  {
    id: "site-dining-001",
    name: "Café Amadeo",
    category: "Dining",
    municipality: "Amadeo",
    address: "Brgy. Dagatan, Amadeo, Cavite",
    description: "Traditional Cavite coffee and local delicacies",
    imageUrl: "https://picsum.photos/seed/dining1/800/600",
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
    description: "Famous for bulalo and scenic views",
    imageUrl: "https://picsum.photos/seed/dining2/800/600",
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
    description: "Authentic Filipino cuisine with volcano view",
    imageUrl: "https://picsum.photos/seed/dining3/800/600",
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
    description: "Luxury resort with panoramic views",
    imageUrl: "https://picsum.photos/seed/stay1/800/600",
    latitude: 14.1137,
    longitude: 120.939,
  },
  {
    id: "site-staycation-002",
    name: "Canyon Cove Resort",
    category: "Staycation",
    municipality: "Nasugbu",
    address: "Piloto Wawa, Nasugbu, Batangas (Cavite border)",
    description: "Beach resort with water activities",
    imageUrl: "https://picsum.photos/seed/stay2/800/600",
    latitude: 14.0691,
    longitude: 120.6302,
  },
  {
    id: "site-staycation-003",
    name: "Taal Vista Hotel",
    category: "Staycation",
    municipality: "Tagaytay",
    address: "Km. 60 Aguinaldo Highway, Tagaytay City",
    description: "Historic hotel overlooking Taal Lake",
    imageUrl: "https://picsum.photos/seed/stay3/800/600",
    latitude: 14.1165,
    longitude: 120.9582,
  },

  // Adventure category
  {
    id: "site-adventure-001",
    name: "Mount Palay-Palay National Park",
    category: "Adventure",
    municipality: "Maragondon",
    address: "Maragondon, Cavite",
    description: "Hiking trails and diverse wildlife",
    imageUrl: "https://picsum.photos/seed/adv1/800/600",
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
    description: "Historical island with war tunnels and ruins",
    imageUrl: "https://picsum.photos/seed/adv2/800/600",
    latitude: 14.3833,
    longitude: 120.5833,
  },
  {
    id: "site-adventure-003",
    name: "Pico de Loro",
    category: "Adventure",
    municipality: "Maragondon",
    address: "Mt. Palay-Palay, Maragondon, Cavite",
    description: "Challenging peak with monolith summit",
    imageUrl: "https://picsum.photos/seed/adv3/800/600",
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
    description: "Birthplace of Philippine independence",
    imageUrl: "https://picsum.photos/seed/heritage1/800/600",
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
    description: "Spanish-era fort guarding Manila Bay",
    imageUrl: "https://picsum.photos/seed/heritage2/800/600",
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
    description: "Memorial of revolutionary victory",
    imageUrl: "https://picsum.photos/seed/heritage3/800/600",
    latitude: 14.438,
    longitude: 120.899,
  },
  {
    id: "site-heritage-004",
    name: "Museo de La Salle",
    category: "Heritage",
    municipality: "Dasmariñas",
    address: "De La Salle University, Dasmariñas, Cavite",
    description: "University museum with historical artifacts",
    imageUrl: "https://picsum.photos/seed/heritage4/800/600",
    latitude: 14.3294,
    longitude: 120.9367,
    operatingHours: "9:00 AM - 4:00 PM",
  },
];

// Itineraries
export const mockItineraries: Itinerary[] = [
  {
    id: "itin-001",
    title: "Day Tour A: Heritage Trail",
    type: "Day Tour",
    description: "Explore historical landmarks of Cavite",
    duration: "8 hours",
    imageUrl: "https://picsum.photos/seed/itin1/800/600",
    siteIds: [
      "site-heritage-001",
      "site-heritage-002",
      "site-heritage-003",
      "site-dining-001",
    ],
    stops: 4,
  },
  {
    id: "itin-002",
    title: "Day Tour B: Tagaytay Escape",
    type: "Day Tour",
    description: "Scenic views and local cuisine",
    duration: "10 hours",
    imageUrl: "https://picsum.photos/seed/itin2/800/600",
    siteIds: ["site-dining-002", "site-staycation-001", "site-adventure-001"],
    stops: 3,
  },
  {
    id: "itin-003",
    title: "Overnight Tour A: Coastal Adventure",
    type: "Overnight Tour",
    description: "Beach resort and water activities",
    duration: "2 days",
    imageUrl: "https://picsum.photos/seed/itin3/800/600",
    siteIds: ["site-staycation-002", "site-adventure-002", "site-dining-001"],
    stops: 3,
  },
  {
    id: "itin-004",
    title: "Overnight Tour B: Complete Cavite Experience",
    type: "Overnight Tour",
    description: "Mix of heritage, nature, and relaxation",
    duration: "2 days",
    imageUrl: "https://picsum.photos/seed/itin4/800/600",
    siteIds: [
      "site-heritage-001",
      "site-staycation-001",
      "site-adventure-001",
      "site-dining-002",
    ],
    stops: 4,
  },
  {
    id: "itin-005",
    title: "Day Tour C: Food Lover's Route",
    type: "Day Tour",
    description: "Culinary journey through Cavite",
    duration: "6 hours",
    imageUrl: "https://picsum.photos/seed/itin5/800/600",
    siteIds: ["site-dining-001", "site-dining-002", "site-dining-003"],
    stops: 3,
  },
];

// Events
export const mockEvents: Event[] = [
  {
    id: "event-001",
    title: "Cavite City Charter Day",
    date: new Date("2027-03-10"),
    endDate: new Date("2027-03-12"),
    location: "Cavite City Plaza",
    address: "Plaza Soledad, Cavite City",
    latitude: 14.4791,
    longitude: 120.8973,
    description:
      "Three-day celebration of Cavite City's charter anniversary with cultural programs, street dancing, and food festivals",
    imageUrl: "https://picsum.photos/seed/event1/800/600",
    status: "happening",
    festivalStamp: {
      pointsBonus: 50,
      available: true,
    },
  },
  {
    id: "event-002",
    title: "Regada Water Festival",
    date: new Date("2027-05-14"),
    endDate: new Date("2027-05-15"),
    location: "Cavite City",
    address: "Streets of Cavite City",
    latitude: 14.4791,
    longitude: 120.8973,
    description:
      "Traditional water-splashing festival celebrating San Roque, featuring street processions and water battles",
    imageUrl: "https://picsum.photos/seed/event2/800/600",
    status: "upcoming",
    festivalStamp: {
      pointsBonus: 50,
      available: true,
    },
  },
  {
    id: "event-003",
    title: "Pahimis Festival",
    date: new Date("2027-08-20"),
    endDate: new Date("2027-08-22"),
    location: "Kawit",
    address: "Kawit Municipal Hall",
    latitude: 14.4444,
    longitude: 120.9028,
    description:
      "Harvest festival showcasing local agricultural products, crafts, and traditional performances",
    imageUrl: "https://picsum.photos/seed/event3/800/600",
    status: "upcoming",
  },
  {
    id: "event-004",
    title: "Tagaytay Arts & Crafts Fair",
    date: new Date("2027-04-15"),
    endDate: new Date("2027-04-17"),
    location: "People's Park",
    address: "People's Park in the Sky, Tagaytay City",
    latitude: 14.1095,
    longitude: 120.9745,
    description:
      "Annual showcase of local artisans, painters, and craftspeople with live demonstrations",
    imageUrl: "https://picsum.photos/seed/event4/800/600",
    status: "upcoming",
  },
  {
    id: "event-005",
    title: "Independence Day Commemoration",
    date: new Date("2027-06-12"),
    location: "Aguinaldo Shrine",
    address: "Emilio Aguinaldo Highway, Kawit, Cavite",
    latitude: 14.4444,
    longitude: 120.9028,
    description:
      "Annual flag-raising ceremony and cultural program at the birthplace of Philippine independence",
    imageUrl: "https://picsum.photos/seed/event5/800/600",
    status: "upcoming",
  },
];

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
export const mockPromoPeriod: PromoPeriod = {
  startDate: new Date("2027-01-01"),
  endDate: new Date("2027-03-31"),
  active: true,
};
