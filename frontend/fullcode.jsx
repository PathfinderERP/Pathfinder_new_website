import React, { useEffect, useMemo, useState } from "react";

// Path-Verse Overview — CLEAN SINGLE-FILE PREVIEW
// Fixes: removed corrupted JSX, completed closing tags (incl. <div className=...>),
// simplified nav (no broken mega menu), and added lightweight runtime tests.
// Tailwind classes assumed. No external deps.

/********************
 * ROOT
 *******************/
export default function PathVerseOverview() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth">
      <TopNav />
      <Hero />
      <KPIRibbon />
      <Pillars />
      <Courses />
      <Results />
      <Reels audience="Student" />
      <Centers />
      <Students />
      <Admissions />
      <Events />
      <Lumos />
      <PathTex />
      <Blog />
      <Community />
      <FAQ />
      <FinalCTA />
      <Footer />
      <Diagnostics />
    </div>
  );
}

/********************
 * NAVIGATION (simplified & robust)
 *******************/
function TopNav() {
  const tabs = [
    { t: "Overview", href: "#hero" },
    { t: "About Us", href: "#pillars" },
    { t: "Courses", href: "#courses" },
    { t: "Centers", href: "#centers" },
    { t: "Student Corner", href: "#students" },
    { t: "Franchisee", href: "#admissions" },
    { t: "Blogs", href: "#blog" },
    { t: "Community", href: "#community" },
    { t: "Apply Now", href: "#apply" },
    { t: "Lumos", href: "#lumos" },
    { t: "PathTex", href: "#pathtex" },
  ];
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center font-bold">PF</div>
          <span className="font-semibold">Pathfinder</span>
        </div>
        <nav className="hidden lg:flex gap-2">
          {tabs.map((x) => (
            <a key={x.t} href={x.href} className="px-3 py-2 rounded-xl hover:bg-slate-100">
              {x.t}
            </a>
          ))}
        </nav>
        <a href="#apply" className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:brightness-110">Apply Now</a>
      </div>
    </header>
  );
}

/********************
 * HERO
 *******************/
function Hero() {
  return (
    <section id="hero" className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-5xl font-extrabold leading-tight">
            Born in Bengal. <span className="text-sky-500">Built for the Best.</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            From Class 6 to IIT/AIIMS — mentorship, rigor, and results at scale.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#apply" className="px-5 py-3 rounded-xl bg-emerald-600 text-white">Apply Now</a>
            <a href="#admissions" className="px-5 py-3 rounded-xl border border-slate-300">Book Counselling</a>
            <a href="#events" className="px-5 py-3 rounded-xl border border-slate-300">Try Free Mock</a>
          </div>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
            <span>Trusted by 2,37,000+ families</span>
            <span>•</span>
            <span>Avg uplift +21.3%</span>
            <span>•</span>
            <span>4.7★ centers</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[9/16] bg-slate-200 rounded-2xl overflow-hidden shadow relative">
              <img
                src={`https://images.unsplash.com/photo-15${i}8895949257-7621c3c786d7?w=500`}
                alt="reel"
                className="object-cover w-full h-full"
              />
              <div className="absolute bottom-2 left-2 right-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                Story {i}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * KPI RIBBON
 *******************/
function KPIRibbon() {
  const stats = [
    { label: "Students Taught", value: 237000 },
    { label: "Toppers Made", value: 5193 },
    { label: "Avg Score Uplift", value: 21.3, suffix: "%" },
    { label: "Centers", value: 42 },
    { label: "Scholarships Awarded", value: 17856 },
    { label: "Mock Attempts", value: 921345 },
  ];
  return (
    <section id="kpis" className="border-y border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {stats.map((s) => (
          <KPICard key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}

function KPICard({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const v = useCountUp(value, 700);
  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50 hover:bg-white">
      <div className="text-2xl font-bold">
        {Number.isFinite(v) ? v.toLocaleString() : value.toLocaleString()} {suffix || ""}
      </div>
      <div className="text-slate-600 text-sm">{label}</div>
    </div>
  );
}

function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = 30;
    const inc = target / steps;
    const id = setInterval(() => {
      start += inc;
      if ((inc > 0 && start >= target) || (inc < 0 && start <= target)) {
        setVal(target);
        clearInterval(id);
      } else {
        setVal(start);
      }
    }, Math.max(16, duration / steps));
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

/********************
 * PILLARS
 *******************/
function Pillars() {
  const items = [
    { title: "Mentorship", sub: "Elite teachers who build champions.", icon: "🎓" },
    { title: "Systems", sub: "Doubt-clearing, mocks, analytics, routines.", icon: "⚙️" },
    { title: "Community", sub: "A tribe that compounds your effort.", icon: "🌱" },
  ];
  return (
    <section id="pillars" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-3 gap-4">
        {items.map((i) => (
          <div key={i.title} className="rounded-2xl border border-slate-200 p-6 bg-white hover:shadow-md">
            <div className="text-2xl">{i.icon}</div>
            <div className="mt-2 font-semibold text-lg">{i.title}</div>
            <div className="text-slate-600">{i.sub}</div>
            <a href="#about" className="inline-block mt-3 text-sky-600">Learn more →</a>
          </div>
        ))}
      </div>
    </section>
  );
}

/********************
 * COURSES
 *******************/
function Courses() {
  const [filter, setFilter] = useState<string | null>(null);
  const chips = ["Class 6-8", "Class 9-10", "Boards", "JEE", "NEET", "Online", "Center"];
  const data = [
    { name: "Foundation Class 8", goal: "Boards", mode: "Center", price: "₹35k–₹55k", start: "Dec 5", badge: "New batch" },
    { name: "ICSE CRP Class 10", goal: "Boards", mode: "Center", price: "₹25k–₹45k", start: "Dec 1", badge: "Filling fast" },
    { name: "CBSE CRP Class 10", goal: "Boards", mode: "Online", price: "₹22k–₹40k", start: "Nov 28" },
    { name: "JEE 2-Year", goal: "JEE", mode: "Center", price: "₹85k–₹1.4L", start: "Apr 10" },
    { name: "NEET Repeater", goal: "NEET", mode: "Center", price: "₹90k–₹1.5L", start: "Nov 25", badge: "Scholarship" },
  ];
  const filtered = filter ? data.filter((d) => d.name.includes(filter) || d.goal === filter || d.mode === filter) : data;
  return (
    <section id="courses" className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Find your program</h2>
          <a href="#apply" className="text-sky-600">View all →</a>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => setFilter((f) => (f === c ? null : c))}
              className={`px-3 py-1.5 rounded-xl border ${filter === c ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {filtered.map((c) => (
              <div key={c.name} className="w-80 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{c.name}</div>
                  {c.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{c.badge}</span>
                  )}
                </div>
                <div className="text-slate-600">Goal: {c.goal} • Mode: {c.mode}</div>
                <div className="mt-3 text-sm text-slate-600">Starts {c.start}</div>
                <div className="mt-2 text-lg font-bold">{c.price}</div>
                <div className="mt-3 flex gap-2">
                  <a href="#apply" className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white">Apply</a>
                  <a href="#" className="px-3 py-1.5 rounded-lg border">Brochure</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/********************
 * RESULTS
 *******************/
function Results() {
  const tabs = ["Boards", "JEE", "NEET", "WBJEE"] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Boards");
  const cards = new Array(8).fill(0).map((_, i) => ({
    name: `Topper ${i + 1}`,
    score: 99 - i * 0.3,
    photo: `https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&sig=${i}`,
    quote: "Consistent mocks changed everything.",
  }));
  return (
    <section id="results" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Results & toppers</h2>
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-xl border ${tab === t ? "bg-slate-900 text-white" : "bg-white"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow">
              <img src={c.photo} alt="topper" className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-slate-600">Score {c.score.toFixed(1)}%</div>
                <p className="text-sm mt-2 text-slate-700 italic">“{c.quote}”</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * REELS
 *******************/
function Reels({ audience }: { audience: string }) {
  const list = new Array(6).fill(0).map((_, i) => ({
    id: `${audience}-${i}`,
    poster: `https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=600&sig=${i}`,
    title: `${audience} story ${i + 1}`,
  }));
  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-bold mb-3">Unfiltered reels</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {list.map((r) => (
            <div key={r.id} className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-200 relative">
              <img src={r.poster} className="w-full h-full object-cover" alt="reel" />
              <button className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white/90 text-sm">▶︎ Play</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * CENTERS
 *******************/
function Centers() {
  const centers = [
    { name: "Kolkata (Baguiati)", rating: 4.8, distance: "2.1 km", courses: "Boards, JEE", address: "Baguiati Main Rd" },
    { name: "Durgapur City Center", rating: 4.7, distance: "—", courses: "NEET, Boards", address: "Sarat Rd" },
    { name: "Siliguri Junction", rating: 4.6, distance: "—", courses: "JEE, WBJEE", address: "Hill Cart Rd" },
  ];
  return (
    <section id="centers" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Centers near you</h2>
          <button className="px-3 py-1.5 rounded-xl border">Detect location</button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white h-80 grid place-items-center text-slate-500">
            <span>🗺️ Map preview (interactive in production)</span>
          </div>
          <div className="space-y-3">
            {centers.map((c) => (
              <div key={c.name} className="rounded-2xl border border-slate-200 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm">{c.rating}★</div>
                </div>
                <div className="text-sm text-slate-600">{c.address}</div>
                <div className="text-sm text-slate-600">Courses: {c.courses}</div>
                <div className="mt-2 flex gap-2">
                  <a href="#" className="px-3 py-1.5 rounded-lg border">Visit page</a>
                  <a href="#admissions" className="px-3 py-1.5 rounded-lg bg-slate-900 text-white">Book counselling</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/********************
 * STUDENT CORNER
 *******************/
function Students() {
  const tiles = [
    { t: "Exam Portal", lock: false },
    { t: "Doubt-Clearing", lock: false },
    { t: "Downloads", lock: false },
    { t: "Topper Scripts", lock: false },
    { t: "Timetables", lock: false },
    { t: "Community Forum", lock: true },
  ];
  return (
    <section id="students" className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Student Corner</h2>
          <a className="text-sky-600" href="#">Go to portal →</a>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tiles.map((t) => (
            <div key={t.t} className="rounded-2xl border border-slate-200 p-6 bg-slate-50 hover:bg-white">
              <div className="font-semibold">{t.t}</div>
              <div className="text-sm text-slate-600 mt-1">Tools to help you win</div>
              {t.lock && (
                <div className="mt-2 text-xs inline-block px-2 py-0.5 rounded-full bg-slate-200">Login required</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * ADMISSIONS FLOW
 *******************/
function Admissions() {
  const steps = [
    { t: "Explore", s: "Browse courses & centers" },
    { t: "Counselling", s: "Book a free session" },
    { t: "Diagnostic", s: "Baseline test & review" },
    { t: "Offer", s: "Scholarship & plan" },
    { t: "Enrol", s: "Token & onboarding" },
  ];
  return (
    <section id="admissions" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-bold mb-4">How to get started</h2>
        <div className="grid md:grid-cols-5 gap-4">
          {steps.map((s, i) => (
            <div key={s.t} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-3xl">{i + 1}</div>
              <div className="font-semibold mt-1">{s.t}</div>
              <div className="text-sm text-slate-600">{s.s}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <a id="apply" href="#apply" className="px-4 py-2 rounded-xl bg-emerald-600 text-white">Apply Now</a>
          <a href="#" className="px-4 py-2 rounded-xl border">Download Brochure</a>
        </div>
      </div>
    </section>
  );
}

/********************
 * EVENTS & DEADLINES
 *******************/
function Events() {
  const items = [
    { d: "Nov 12", t: "Scholarship window ends", cta: "Register" },
    { d: "Nov 18", t: "New batch starts (multi-center)", cta: "Apply" },
    { d: "Nov 22", t: "Parent Counselling Webinar", cta: "Join" },
  ];
  return (
    <section id="events" className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-bold mb-3">Upcoming events & deadlines</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {items.map((e, i) => (
              <div key={i} className="w-80 shrink-0 rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-sm text-slate-500">{e.d}</div>
                <div className="font-semibold">{e.t}</div>
                <button className="mt-3 px-3 py-1.5 rounded-lg bg-slate-900 text-white">{e.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/********************
 * LUMOS
 *******************/
function Lumos() {
  const products = [
    { t: "Key to Success — Boards", p: "₹999 ₹499", img: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800" },
    { t: "Exam Planner Bundle", p: "₹799 ₹399", img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800" },
    { t: "Pathfinder Tote", p: "₹699 ₹349", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800" },
  ];
  return (
    <section id="lumos" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Lumos spotlight</h2>
          <a href="#" className="text-sky-600">View all →</a>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.t} className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
              <img src={p.img} className="w-full h-44 object-cover" alt="product" />
              <div className="p-4">
                <div className="font-semibold">{p.t}</div>
                <div className="text-emerald-700 font-bold">{p.p}</div>
                <div className="mt-2 flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg border">Details</button>
                  <button className="px-3 py-1.5 rounded-lg bg-slate-900 text-white">Add to cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * PATHTEX
 *******************/
function PathTex() {
  const items = [
    { t: "AI Exam Analytics", s: "Personalized insights & error radar.", icon: "🤖" },
    { t: "OCR Notes", s: "Scan • search • study smarter.", icon: "📝" },
    { t: "Teacher Dashboards", s: "Plan, track, and intervene fast.", icon: "📊" },
  ];
  return (
    <section id="pathtex" className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-bold mb-3">PathTex — innovation at work</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((i) => (
            <div key={i.t} className="rounded-2xl border border-slate-200 p-6 bg-slate-50 hover:bg-white">
              <div className="text-3xl">{i.icon}</div>
              <div className="mt-2 font-semibold">{i.t}</div>
              <div className="text-slate-600">{i.s}</div>
              <a href="#" className="mt-3 inline-block text-sky-600">See demo →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * BLOG
 *******************/
function Blog() {
  const posts = [
    { t: "Boards: 30-day sprint plan", c: "Deep Guide", img: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800" },
    { t: "New batches announced", c: "Announcement", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800" },
    { t: "How to use mocks well", c: "Deep Guide", img: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800" },
    { t: "Motivation for finals", c: "Motivation", img: "https://images.unsplash.com/photo-1515165562835-c3b8c4f0a6c3?w=800" },
  ];
  return (
    <section id="blog" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Latest from the blog</h2>
          <a href="#" className="text-sky-600">Read all →</a>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {posts.map((p) => (
            <article key={p.t} className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
              <img src={p.img} className="w-full h-36 object-cover" alt="cover" />
              <div className="p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">{p.c}</div>
                <h3 className="font-semibold">{p.t}</h3>
                <a href="#" className="text-sky-600 text-sm">Read →</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * COMMUNITY
 *******************/
function Community() {
  const items = [
    { t: "Kolkata Chapter", s: "4.6k members", badge: "Hero of the Week" },
    { t: "Durgapur Chapter", s: "1.1k members" },
    { t: "Siliguri Chapter", s: "800+ members" },
  ];
  return (
    <section id="community" className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Community & Alumni</h2>
          <a href="#" className="text-sky-600">Join a chapter →</a>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((i) => (
            <div key={i.t} className="rounded-2xl border border-slate-200 p-6 bg-slate-50 hover:bg-white">
              <div className="font-semibold">{i.t}</div>
              <div className="text-sm text-slate-600">{i.s}</div>
              {i.badge && (
                <div className="mt-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 inline-block">
                  {i.badge}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * FAQ
 *******************/
function FAQ() {
  const faqs = [
    { q: "When do new batches start?", a: "Multiple intakes; check the Courses section for exact dates." },
    { q: "How do scholarships work?", a: "Based on diagnostics and merit; see Admissions for current window." },
    { q: "Online vs Center?", a: "Choose based on proximity & learning style. Both follow the same rigor." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-bold mb-3">Frequently asked questions</h2>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i} className="border border-slate-200 rounded-2xl bg-white">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-4 py-3 font-medium flex items-center justify-between"
              >
                <span>{f.q}</span>
                <span>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div className="px-4 pb-4 text-slate-600">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * FINAL CTA & FOOTER
 *******************/
function FinalCTA() {
  return (
    <section className="py-10 bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h3 className="text-2xl font-bold">Not sure which course fits best?</h3>
          <p className="text-slate-300">Book a free counselling session and get a personalized roadmap.</p>
        </div>
        <div className="flex gap-3">
          <a href="#admissions" className="px-4 py-2 rounded-xl bg-white text-slate-900">Book Counselling</a>
          <a href="#apply" className="px-4 py-2 rounded-xl bg-emerald-600">Apply Now</a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { h: "Courses", links: ["Foundation", "Boards", "JEE", "NEET", "Mock Tests"] },
    { h: "Centers", links: ["Kolkata", "Durgapur", "Siliguri", "All centers"] },
    { h: "Resources", links: ["Blog", "Downloads", "Student Corner", "Community"] },
    { h: "Company", links: ["About", "Franchisee", "Careers", "Contact"] },
  ];
  return (
    <footer id="footer" className="bg-white border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        {cols.map((c) => (
          <div key={c.h}>
            <div className="font-semibold mb-2">{c.h}</div>
            <ul className="space-y-1 text-slate-600">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-slate-900">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-8 text-sm text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">PF</div>
          <span>© {new Date().getFullYear()} Pathfinder Educational Institute</span>
        </div>
        <div className="space-x-3">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Refund</a>
        </div>
      </div>
    </footer>
  );
}

/********************
 * DIAGNOSTICS (runtime tests)
 *******************/
function Diagnostics() {
  // Very lightweight runtime tests to catch regressions in this single file.
  const tests = useMemo(() => {
    const results: { name: string; pass: boolean; note?: string }[] = [];
    // Test 1: All key sections exist by id
    const ids = [
      "hero",
      "kpis",
      "pillars",
      "courses",
      "results",
      "centers",
      "students",
      "admissions",
      "events",
      "lumos",
      "pathtex",
      "blog",
      "community",
      "faq",
    ];
    const missing = ids.filter((id) => typeof document !== "undefined" && !document.getElementById(id));
    results.push({ name: "All core sections rendered", pass: missing.length === 0, note: missing.length ? `Missing: ${missing.join(", ")}` : "" });

    // Test 2: Footer exists and has 4 columns
    const footerCols = typeof document !== "undefined" ? document.querySelectorAll("footer ul").length : 0;
    results.push({ name: "Footer has 4 columns", pass: footerCols === 4, note: `found ${footerCols}` });

    // Test 3: Courses filter chips render
    const chipCount = typeof document !== "undefined" ? document.querySelectorAll('#courses button[class*="rounded-xl"]').length : 0;
    results.push({ name: "Course filter chips visible", pass: chipCount >= 6, note: `found ${chipCount}` });

    return results;
  }, []);

  return (
    <section className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <details>
          <summary className="text-sm text-slate-600 cursor-pointer">Diagnostics (click to view)</summary>
          <ul className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {tests.map((t) => (
              <li key={t.name} className={`px-3 py-2 rounded-lg border ${t.pass ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-slate-600">{t.pass ? "PASS" : "FAIL"}{t.note ? ` — ${t.note}` : ""}</div>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}