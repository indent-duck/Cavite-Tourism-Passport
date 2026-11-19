/**
 * Editorial copy for the Discover → About Cavite view.
 *
 * TBD - pending Tourism Office review. Kept separate from the component so
 * copy can be updated (or moved to the API) without touching layout code.
 */

import type { Category } from "./types";

export const ABOUT_HERO = {
  eyebrow: "HISTORIC HEARTLAND",
  title: "Land of the Brave",
  description:
    "Cavite is the Cradle of Philippine Independence, proclaimed in Kawit in 1898. Walk its heritage towns, cool off on the Tagaytay Ridge, and follow the coast of Manila Bay.",
  /** Cavite's local government units: component cities plus municipalities */
  citiesAndTowns: 23,
} as const;

export interface ProvinceHighlight {
  id: string;
  /** Explore category the card links to; also sets the card's color and icon */
  category: Exclude<Category, "Festival">;
  title: string;
  description: string;
  cta: string;
}

export const PROVINCE_HIGHLIGHTS: readonly ProvinceHighlight[] = [
  {
    id: "heritage",
    category: "Heritage",
    title: "Cradle of Independence",
    description:
      "Shrines, forts and monuments in Kawit and Cavite City where the Revolution unfolded.",
    cta: "Heritage sites",
  },
  {
    id: "highlands",
    category: "Staycation",
    title: "Tagaytay Ridge",
    description:
      "Cool highland air and resort views over Taal Lake and its volcano.",
    cta: "Staycations",
  },
  {
    id: "outdoors",
    category: "Adventure",
    title: "Peaks & Islands",
    description:
      "Hike Mount Palay-Palay and Pico de Loro, or sail out to Corregidor at the mouth of Manila Bay.",
    cta: "Adventures",
  },
  {
    id: "food",
    category: "Dining",
    title: "Flavors of Cavite",
    description:
      "Amadeo's barako coffee, coastal noodle dishes and upland sweets.",
    cta: "Places to eat",
  },
];

export interface HistoryMilestone {
  year: string;
  title: string;
  description: string;
  /** Related site, linked when it exists in the sites catalog */
  siteId?: string;
}

export const HISTORY_TIMELINE: readonly HistoryMilestone[] = [
  {
    year: "1872",
    title: "Cavite Mutiny",
    description:
      "Filipino soldiers and workers at Fort San Felipe rise against Spanish rule. The crackdown that follows fuels the reform movement.",
    siteId: "site-heritage-002",
  },
  {
    year: "1896",
    title: "Battle of Binakayan-Dalahican",
    description:
      "One of the first major Filipino victories of the Revolution, fought in Kawit.",
    siteId: "site-heritage-003",
  },
  {
    year: "1898",
    title: "Independence Declared",
    description:
      "On June 12, Philippine independence is proclaimed from the Aguinaldo house in Kawit, where the national flag is first unfurled.",
    siteId: "site-heritage-001",
  },
];

export interface SignatureDish {
  id: string;
  name: string;
  origin: string;
  /** MaterialCommunityIcons glyph */
  icon: "coffee" | "noodles" | "bowl-mix" | "candy";
}

// TBD - dish names and origins pending Tourism Office confirmation
export const SIGNATURE_DISHES: readonly SignatureDish[] = [
  { id: "barako", name: "Kapeng Barako", origin: "Amadeo's Liberica brew", icon: "coffee" },
  { id: "pancit", name: "Pancit Puso", origin: "Cavite City tradition", icon: "noodles" },
  { id: "burong", name: "Tambalang Burong", origin: "Gen. Trias, rich in coconut", icon: "bowl-mix" },
  { id: "panutsa", name: "Panutsa", origin: "Silang sweet treat", icon: "candy" },
];

/** Number of upcoming events previewed before "View all" */
export const FESTIVAL_PREVIEW_COUNT = 3;
