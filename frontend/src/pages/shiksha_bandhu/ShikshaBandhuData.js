/**
 * Pathfinder Shiksha Bandhu Data Layer & Utilities
 */

export const PROGRAMS = [
  {
    id: "madhyamik-2027",
    slug: "madhyamik",
    name: "Madhyamik Mock Test 2027",
    board: "WBBSE",
    className: "Class X",
    price: 4500,
    description:
      "Prepare smarter with mock tests, checked answer scripts and the Key to Success booklet.",
    includes: [
      "Mock Test 1",
      "Mock Test 2",
      "Checked Answer Scripts",
      "Key to Success Booklet",
    ],
    featured: true,
    status: "active",
  },
  {
    id: "cbse-x",
    slug: "cbse-x",
    name: "CBSE Class X Mock Test",
    board: "CBSE",
    className: "Class X",
    price: 7500,
    description:
      "Pre-mock and full mock tests with expert-checked answer scripts for CBSE Class X.",
    includes: [
      "Pre-Mock Tests",
      "Mock Tests",
      "Checked Answer Scripts",
      "Key to Success Booklet",
    ],
    status: "active",
  },
  {
    id: "cbse-xii",
    slug: "cbse-xii",
    name: "CBSE Class XII Mock Test",
    board: "CBSE",
    className: "Class XII",
    price: 7500,
    description:
      "Two full mock tests for 5 subjects with corrected answer scripts of CBSE toppers.",
    includes: [
      "Mock Test 1",
      "Mock Test 2",
      "Checked Answer Scripts",
      "Key to Success Booklet",
    ],
    status: "active",
  },
  {
    id: "icse-x",
    slug: "icse-x",
    name: "ICSE Class X Mock Test",
    board: "ICSE",
    className: "Class X",
    price: 9000,
    description:
      "3 sets of ICSE mock tests with checked answer scripts of top AIR toppers.",
    includes: [
      "3 Sets of Mock Tests",
      "Checked Answer Scripts",
      "Key to Success Booklet",
    ],
    status: "active",
  },
  {
    id: "isc-xii",
    slug: "isc-xii",
    name: "ISC Class XII Mock Test",
    board: "ISC",
    className: "Class XII",
    price: 5500,
    description:
      "2 sets of ISC mock tests for 5 subjects with expert-checked answer scripts.",
    includes: [
      "2 Sets of Mock Tests",
      "Checked Answer Scripts",
      "Key to Success Booklet",
    ],
    status: "active",
  },
];

export function getProgram(slug) {
  return PROGRAMS.find((p) => p.slug === slug || p.id === slug);
}

export const DEMO_BANDHU = {
  id: "SB004",
  name: "Partner",
  mobile: "",
  email: "",
  joinedOn: "Today",
  status: "active",
  stats: {
    clicks: 0,
    registrations: 0,
    successfulReferrals: 0,
    totalBonus: 0,
    pendingBonus: 0,
    thisMonth: 0,
  },
};

export const DEMO_REFERRALS = [];

export const DEMO_BONUS_HISTORY = [];

export const PATHFINDER_PHONE = "9147178886";

export function referralLink(referralId, programSlug) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://pathfinder.edu.in";
  return `${origin}/sb/${referralId}${programSlug ? `/${programSlug}` : ""}`;
}

export function formatINR(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
