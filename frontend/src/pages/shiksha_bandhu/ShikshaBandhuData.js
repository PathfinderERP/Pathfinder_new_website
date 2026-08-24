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
  name: "Rahul Das",
  mobile: "+91 91471 78886",
  email: "rahul.das@example.com",
  joinedOn: "12 Feb 2026",
  status: "active",
  stats: {
    clicks: 128,
    registrations: 24,
    successfulReferrals: 12,
    totalBonus: 3000,
    pendingBonus: 500,
    thisMonth: 1500,
  },
};

export const DEMO_REFERRALS = [
  {
    id: "L-1024",
    student: "Student #1024",
    program: "Madhyamik Mock Test",
    date: "18 Aug 2026",
    status: "Successful",
    bonus: 250,
  },
  {
    id: "L-1031",
    student: "Student #1031",
    program: "CBSE Class X",
    date: "19 Aug 2026",
    status: "Pending",
    bonus: null,
  },
  {
    id: "L-1038",
    student: "Student #1038",
    program: "CBSE Class XII",
    date: "20 Aug 2026",
    status: "Successful",
    bonus: 250,
  },
  {
    id: "L-1042",
    student: "Student #1042",
    program: "ICSE Class X",
    date: "20 Aug 2026",
    status: "Cancelled",
    bonus: null,
  },
];

export const DEMO_BONUS_HISTORY = [
  {
    date: "18 Aug 2026",
    program: "Madhyamik Mock Test",
    referral: "Student #1024",
    status: "Successful",
    bonus: 250,
  },
  {
    date: "20 Aug 2026",
    program: "CBSE Class XII",
    referral: "Student #1038",
    status: "Successful",
    bonus: 250,
  },
  {
    date: "19 Aug 2026",
    program: "CBSE Class X",
    referral: "Student #1031",
    status: "Pending",
    bonus: 250,
  },
];

export const PATHFINDER_PHONE = "9147178886";

export function referralLink(referralId, programSlug) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://pathfinder.edu.in";
  return `${origin}/sb/${referralId}${programSlug ? `/${programSlug}` : ""}`;
}

export function formatINR(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
