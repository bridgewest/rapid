import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowCircle, SEND_PATH, SiteFooter, SiteNav } from "../components/SiteNav";
import {
  PLATFORM_TAKE,
  RIDE_CLASSES,
  RIDE_PLACES,
  estimateRide,
  formatLrdWhole,
  type RideClassId,
} from "../lib/rideFares";

/* ───────────── content ───────────── */

const steps = [
  { n: "1", title: "Set your pickup", body: "GPS or a landmark — “ELWA Junction”, “Red Light”, “JFK”. No street address needed." },
  { n: "2", title: "See the price first", body: "Pick Keke, Taxi or Comfort. Your fare in Liberian dollars is locked in before you request." },
  { n: "3", title: "Match your driver", body: "Check the name and plate, then give your 4-digit PIN. The trip can't start without it." },
  { n: "4", title: "Arrive & pay", body: "Pay cash or mobile money at drop-off, then rate your driver." },
];

const promises = [
  {
    icon: "price",
    quote: "Know the price before you go. No haggling at the roadside, no surprises at drop-off.",
    who: "Upfront fares",
  },
  {
    icon: "pin",
    quote: "Your trip only starts when you give the driver your PIN. If the plate or the PIN doesn't match, don't get in.",
    who: "Pickup PIN",
  },
  {
    icon: "share",
    quote: "Send your driver, car and plate to family with one tap, so the people who care about you know where you are.",
    who: "Trip sharing",
  },
  {
    icon: "heart",
    quote: "In the U.S. and want your mother home safe from the hospital? Book the ride from wherever you are.",
    who: "Book for family",
  },
] as const;

const rules = [
  { pct: 100, title: "of trips show the fare before you book", foot: "Upfront pricing" },
  { pct: 100, title: "of pickups are confirmed with a rider PIN", foot: "Every ride" },
  { pct: 85, title: "of every fare goes to the driver", foot: "15% platform fee" },
];

const coverage = [
  "Central Monrovia", "Mamba Point", "Capitol Hill", "Sinkor", "Congo Town", "Paynesville",
  "ELWA", "Gardnersville", "Bushrod Island", "New Kru Town", "Duport Road", "RIA Airport",
];

const faqs = [
  {
    q: "How is the fare calculated?",
    a: "A base fare plus distance and estimated time, depending on the ride type. You see the price before you request. If heavy traffic makes the trip much longer, the fare can rise — never more than 50% above the quote.",
  },
  { q: "How do I pay?", a: "Cash or mobile money (Orange Money / MTN MoMo) to the driver at drop-off. In-app payment from your Lizor wallet is coming soon." },
  {
    q: "Can I book a ride for my family from the U.S.?",
    a: "Yes. Choose “Booking for someone else”, enter their name and phone number, and the driver will call them at pickup. You can follow the trip from your phone.",
  },
  {
    q: "What's the difference between Keke, Taxi and Comfort?",
    a: "Keke is a tricycle — the cheapest option for short trips. Taxi is a private yellow taxi just for you. Comfort is a newer car or SUV with A/C, good for the airport and business.",
  },
  {
    q: "How do I become a driver?",
    a: "Download the Lizor app, open Ride → Drive with Lizor, and submit your licence and vehicle details. Bring your documents and vehicle for inspection; once approved you can go online any time.",
  },
];

/* ───────────── small pieces ───────────── */

function useReveal() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);
}

function PromiseIcon({ kind }: { kind: (typeof promises)[number]["icon"] }) {
  const common = { stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
      {kind === "price" && (
        <>
          <path d="M3 12V4h8l10 10-8 8L3 12z" {...common} />
          <circle cx="7.5" cy="8.5" r="1.5" {...common} />
        </>
      )}
      {kind === "pin" && (
        <>
          <rect x="4" y="10" width="16" height="11" rx="2" {...common} />
          <path d="M8 10V7a4 4 0 018 0v3" {...common} />
        </>
      )}
      {kind === "share" && (
        <>
          <circle cx="18" cy="5" r="3" {...common} />
          <circle cx="6" cy="12" r="3" {...common} />
          <circle cx="18" cy="19" r="3" {...common} />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" {...common} />
        </>
      )}
      {kind === "heart" && <path d="M12 21s-7-4.4-9.3-9A5 5 0 0112 6.5 5 5 0 0121.3 12C19 16.6 12 21 12 21z" {...common} />}
    </svg>
  );
}

function LineIcon({ kind }: { kind: "car" | "shield" | "clock" }) {
  const c = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <svg width="56" height="56" viewBox="0 0 48 48" aria-hidden>
      {kind === "car" && (
        <>
          <path d="M8 32v5h5v-3h22v3h5v-5M8 32h32v-8l-4-9H12l-4 9v8zM8 24h32" {...c} />
          <circle cx="15" cy="28" r="1.5" {...c} />
          <circle cx="33" cy="28" r="1.5" {...c} />
          <path d="M22 8c0-2 2-3 3-1 1-2 3-1 3 1 0 2-3 4-3 4s-3-2-3-4z" fill="currentColor" />
        </>
      )}
      {kind === "shield" && (
        <>
          <path d="M24 6l14 5v10c0 10-6 17-14 21-8-4-14-11-14-21V11l14-5z" {...c} />
          <path d="M17 24l5 5 9-10" {...c} />
        </>
      )}
      {kind === "clock" && (
        <>
          <circle cx="24" cy="24" r="16" {...c} />
          <path d="M24 14v10l7 5" {...c} />
          <path d="M6 10l4 3M42 10l-4 3" {...c} />
        </>
      )}
    </svg>
  );
}

/** Animated night-street illustration for the hero. */
function HeroScene() {
  return (
    <svg className="rr-hero__scene" viewBox="0 0 1440 720" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#030817" />
          <stop offset="0.6" stopColor="#0a1a3f" />
          <stop offset="1" stopColor="#10285e" />
        </linearGradient>
        <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3b82f6" stopOpacity="0" />
          <stop offset="0.5" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#bae6fd" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3b82f6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="720" fill="url(#sky)" />
      {/* skyline */}
      <g fill="#0d1f4a">
        <rect x="40" y="330" width="90" height="230" />
        <rect x="140" y="290" width="70" height="270" />
        <rect x="220" y="360" width="120" height="200" />
        <rect x="360" y="250" width="80" height="310" />
        <rect x="455" y="320" width="140" height="240" />
        <rect x="900" y="300" width="110" height="260" />
        <rect x="1020" y="240" width="70" height="320" />
        <rect x="1100" y="340" width="130" height="220" />
        <rect x="1250" y="280" width="90" height="280" />
        <rect x="1350" y="350" width="90" height="210" />
      </g>
      <g fill="#1e3a8a" opacity="0.9">
        {Array.from({ length: 60 }).map((_, i) => (
          <rect key={i} x={50 + ((i * 97) % 1380)} y={300 + ((i * 53) % 220)} width="6" height="8" opacity={(i % 3) * 0.3 + 0.2} fill={i % 5 === 0 ? "#93c5fd" : "#1e40af"} />
        ))}
      </g>
      <ellipse cx="720" cy="600" rx="700" ry="140" fill="url(#glow)" />
      {/* road */}
      <path d="M0 560 L1440 560 L1440 720 L0 720 Z" fill="#050b1a" />
      <path d="M0 640 H1440" stroke="#1e3a8a" strokeWidth="4" strokeDasharray="40 30" />
      {/* light trails */}
      <g className="rr-trails">
        <rect className="rr-trail rr-trail--a" x="-600" y="598" width="600" height="5" rx="2.5" fill="url(#trail)" />
        <rect className="rr-trail rr-trail--b" x="-600" y="616" width="520" height="4" rx="2" fill="url(#trail)" />
        <rect className="rr-trail rr-trail--c" x="-600" y="668" width="640" height="6" rx="3" fill="url(#trail)" />
        <rect className="rr-trail rr-trail--d" x="-600" y="688" width="480" height="4" rx="2" fill="url(#trail)" />
      </g>
    </svg>
  );
}

/** Top-down car for the crosswalk band. */
function TopDownCar() {
  return (
    <svg className="rr-cross__car" viewBox="0 0 160 300" aria-hidden>
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#dbe4f3" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c7d3e8" />
        </linearGradient>
      </defs>
      <ellipse cx="92" cy="160" rx="72" ry="145" fill="#000" opacity="0.18" />
      <rect x="18" y="8" width="124" height="284" rx="52" fill="url(#body)" stroke="#94a3b8" strokeWidth="2" />
      <path d="M34 70 Q80 48 126 70 L120 112 Q80 100 40 112 Z" fill="#0f172a" />
      <path d="M40 210 Q80 222 120 210 L126 246 Q80 262 34 246 Z" fill="#0f172a" />
      <rect x="44" y="118" width="72" height="86" rx="18" fill="#e2e8f0" stroke="#cbd5e1" />
      <rect x="56" y="148" width="48" height="22" rx="6" fill="#2563eb" />
      <text x="80" y="164" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="Outfit, sans-serif">
        LIZOR
      </text>
      <rect x="10" y="78" width="10" height="20" rx="4" fill="#94a3b8" />
      <rect x="140" y="78" width="10" height="20" rx="4" fill="#94a3b8" />
      <rect x="40" y="14" width="22" height="8" rx="4" fill="#fef9c3" />
      <rect x="98" y="14" width="22" height="8" rx="4" fill="#fef9c3" />
      <rect x="40" y="280" width="22" height="7" rx="3" fill="#ef4444" />
      <rect x="98" y="280" width="22" height="7" rx="3" fill="#ef4444" />
    </svg>
  );
}

/* ───────────── page ───────────── */

export function RideLanding() {
  useReveal();
  useEffect(() => {
    document.title = "Lizor — Rides in Monrovia";
  }, []);

  const [from, setFrom] = useState(3);
  const [to, setTo] = useState(9);
  const [cls, setCls] = useState<RideClassId>("TAXI");
  const est = useMemo(() => estimateRide(from, to), [from, to]);
  const chosen = est.fares.find((f) => f.id === cls)!;
  const same = from === to;

  const [promise, setPromise] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPromise((p) => (p + 1) % promises.length), 7000);
    return () => clearInterval(t);
  }, [promise]);

  const [driveCls, setDriveCls] = useState<RideClassId>("TAXI");
  const [tripsPerDay, setTripsPerDay] = useState(12);
  const [daysPerWeek, setDaysPerWeek] = useState(6);
  const avgTrip = useMemo(() => {
    const c = RIDE_CLASSES.find((r) => r.id === driveCls)!;
    return Math.ceil(Math.max(c.min, c.base + c.perKm * 6 + c.perMin * 20) / 25) * 25;
  }, [driveCls]);
  const weekly = Math.round(avgTrip * tripsPerDay * daysPerWeek * (1 - PLATFORM_TAKE));

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="rapid-landing rr" id="top">
      <SiteNav
        active="ride"
        links={[
          { href: "#book", label: "Book" },
          { href: "#how", label: "How it works" },
          { href: "#safety", label: "Safety" },
          { href: "#drive", label: "Drive" },
          { href: "#faq", label: "FAQ" },
        ]}
        primaryCta={{ label: "Take a ride", onClick: () => go("book") }}
      />

      {/* Announcement bar */}
      <div className="rr-announce">
        <div className="rr-announce__inner">
          <span className="rr-announce__msg">
            <svg width="22" height="30" viewBox="0 0 22 30" fill="none" aria-hidden>
              <rect x="2" y="1.5" width="18" height="27" rx="3.5" stroke="currentColor" strokeWidth="2" />
              <path d="M8 24.5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Be one of the first in Monrovia. Get Lizor today.
          </span>
          <button className="btn-blue btn-blue--pill" type="button" onClick={() => go("book")}>
            Take a ride
          </button>
        </div>
      </div>

      <main>
        {/* Hero */}
        <section className="rr-hero" aria-label="Lizor Ride">
          <HeroScene />
          <div className="rr-hero__words">
            <h1>
              <span>Hail.</span>
              <span>Ride.</span>
            </h1>
            <button className="rr-hero__play" type="button" onClick={() => go("how")}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
                <circle cx="22" cy="22" r="20.5" stroke="currentColor" strokeWidth="2.5" />
                <path d="M18 14.5v15l12-7.5-12-7.5z" fill="currentColor" />
              </svg>
              See how it works
            </button>
          </div>
        </section>

        {/* Meet + booking */}
        <section className="rr-meet" id="book">
          <div className="rr-meet__copy" data-reveal>
            <h2 className="rr-gradient">Meet Lizor Ride</h2>
            <p>Monrovia's ride-hailing service with upfront fares — keke, taxi or comfort car, at your door.</p>
            <a className="rr-link" href="#get-app">
              <ArrowCircle /> Download Lizor today
            </a>
          </div>

          <form className="ride-book" data-reveal onSubmit={(e) => { e.preventDefault(); go("get-app"); }} aria-label="Fare estimate">
            <h3>Where to?</h3>
            <div className="ride-book__route">
              <label className="ride-book__field">
                <span className="ride-book__dot ride-book__dot--from" aria-hidden />
                <span className="sr-only">Pickup</span>
                <select value={from} onChange={(e) => setFrom(Number(e.target.value))}>
                  {RIDE_PLACES.map((p, i) => (
                    <option key={p.label} value={i}>{p.label}</option>
                  ))}
                </select>
              </label>
              <button type="button" className="ride-book__swap" onClick={() => { setFrom(to); setTo(from); }} aria-label="Swap pickup and destination">
                ⇅
              </button>
              <label className="ride-book__field">
                <span className="ride-book__dot ride-book__dot--to" aria-hidden />
                <span className="sr-only">Destination</span>
                <select value={to} onChange={(e) => setTo(Number(e.target.value))}>
                  {RIDE_PLACES.map((p, i) => (
                    <option key={p.label} value={i}>{p.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="ride-book__classes" role="radiogroup" aria-label="Ride type">
              {est.fares.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={cls === f.id}
                  className={"ride-class" + (cls === f.id ? " is-active" : "")}
                  onClick={() => setCls(f.id)}
                >
                  <span className="ride-class__icon" aria-hidden>{f.icon}</span>
                  <span className="ride-class__name">
                    {f.label}
                    <small>{f.seats} seats</small>
                  </span>
                  <span className="ride-class__fare">{same ? "—" : formatLrdWhole(f.fare)}</span>
                </button>
              ))}
            </div>
            <div className="ride-book__meta">{same ? "Choose two different places" : `About ${est.km} km · ${est.min} min`}</div>
            <button className="ride-book__cta" type="submit" disabled={same}>
              {same ? "Choose a destination" : `Request ${chosen.label} · ${formatLrdWhole(chosen.fare)}`}
            </button>
            <p className="ride-book__note">Estimate only. Your exact fare is confirmed in the app before you book.</p>
          </form>
        </section>

        <section className="rr-features" aria-label="Highlights">
          <div data-reveal>
            <LineIcon kind="car" />
            <h3>3 ride types,<br />one app</h3>
          </div>
          <div data-reveal>
            <LineIcon kind="shield" />
            <h3>A PIN on<br />every pickup</h3>
          </div>
          <div data-reveal>
            <LineIcon kind="clock" />
            <h3>Fares from<br />L$ 150</h3>
          </div>
        </section>

        {/* Dark band: big stat + how it works */}
        <section className="rr-dark" id="how">
          <div className="rr-dark__inner">
            <div className="rr-bigstat" data-reveal>
              <div className="rr-bigstat__num">
                <small>keep</small>
                85%
              </div>
              <div className="rr-bigstat__text">
                <strong>of every fare</strong>
                <span>goes to your driver*</span>
                <a className="rr-link rr-link--light" href="#drive">
                  <ArrowCircle /> Drive with Lizor
                </a>
              </div>
              <div className="rr-bigstat__pill" aria-hidden>
                <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                  <rect width="400" height="200" fill="#0b1836" />
                  <path d="M-10 150 C80 120 120 170 200 130 S330 50 410 70" stroke="#1e3a8a" strokeWidth="18" fill="none" />
                  <path d="M90 -10 C110 60 100 130 150 210" stroke="#172554" strokeWidth="12" fill="none" />
                  <path d="M60 150 C130 140 170 110 220 100 S300 80 330 62" stroke="#60a5fa" strokeWidth="5" strokeLinecap="round" fill="none" />
                  <circle cx="60" cy="150" r="9" fill="#22c55e" />
                  <circle cx="330" cy="62" r="9" fill="#f8fafc" />
                  <rect x="236" y="20" width="140" height="44" rx="10" fill="#2563eb" />
                  <text x="306" y="40" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700" fontFamily="Outfit, sans-serif">Arriving in 4 min</text>
                  <text x="306" y="56" textAnchor="middle" fill="#bfdbfe" fontSize="11" fontFamily="Outfit, sans-serif">TX-1042 · Taxi</text>
                </svg>
              </div>
              <p className="rr-bigstat__foot">*Lizor keeps a 15% platform fee. Drivers keep the rest of every fare.</p>
            </div>

            <h2 className="rr-dark__h" data-reveal>See how a Lizor ride works</h2>
            <div className="rr-steps">
              {steps.map((s) => (
                <article className="rr-step" key={s.n} data-reveal>
                  <div className="rr-step__visual">
                    <span className="rr-step__ring">{s.n}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Ride types */}
        <section className="rr-section" id="vehicles">
          <h2 className="rr-h2" data-reveal>A ride for every trip</h2>
          <div className="ride-vehicles">
            {RIDE_CLASSES.map((c) => (
              <article className={"ride-vehicle ride-vehicle--" + c.id.toLowerCase()} key={c.id} data-reveal>
                <div className="ride-vehicle__icon" aria-hidden>{c.icon}</div>
                <h3>{c.label}</h3>
                <p>{c.bestFor}</p>
                <dl>
                  <div><dt>Seats</dt><dd>{c.seats}</dd></div>
                  <div><dt>From</dt><dd>{formatLrdWhole(c.min)}</dd></div>
                  <div><dt>Per km</dt><dd>{formatLrdWhole(c.perKm)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        {/* Promise (blue) */}
        <section className="rr-promise" aria-label="The Lizor promise">
          <div className="rr-promise__inner">
            <p className="rr-promise__title">Why ride with Lizor</p>
            <hr />
            <figure className="rr-promise__body" aria-live="polite">
              <svg width="56" height="44" viewBox="0 0 56 44" aria-hidden>
                <path d="M0 44V26C0 10 8 2 22 0l2 6c-8 2-12 8-12 14h10v24H0zm32 0V26C32 10 40 2 54 0l2 6c-8 2-12 8-12 14h10v24H32z" fill="currentColor" />
              </svg>
              <blockquote key={promise}>{promises[promise].quote}</blockquote>
              <figcaption>{promises[promise].who}</figcaption>
            </figure>
            <div className="rr-promise__dots" role="tablist" aria-label="Choose a promise">
              {promises.map((p, i) => (
                <button
                  key={p.who}
                  role="tab"
                  aria-selected={i === promise}
                  aria-label={p.who}
                  className={i === promise ? "is-active" : ""}
                  onClick={() => setPromise(i)}
                >
                  <PromiseIcon kind={p.icon} />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Signup card overlapping blue → white */}
        <div className="rr-signup-wrap">
          <div className="rr-signup" data-reveal>
            <span className="rr-signup__icon" aria-hidden>
              <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
                <rect x="1" y="3" width="26" height="19" rx="2" stroke="#fff" strokeWidth="1.8" />
                <path d="M1.5 4l12.5 10L26.5 4" stroke="#fff" strokeWidth="1.8" />
                <circle cx="26" cy="4" r="4" fill="#3b82f6" />
              </svg>
            </span>
            <p>Get the latest on Lizor Ride, new neighbourhoods, and where we're headed next.</p>
            <button className="btn-blue btn-blue--square" type="button" onClick={() => go("get-app")}>
              Get the app
            </button>
          </div>
        </div>

        {/* Crosswalk + drivers */}
        <section className="rr-cross" aria-hidden>
          <div className="rr-cross__stripes" />
          <TopDownCar />
        </section>
        <section className="rr-drivers" id="drive">
          <div className="rr-drivers__copy" data-reveal>
            <h2 className="rr-h2">Meet the people behind every ride</h2>
            <p>
              Lizor drivers are Monrovia's own — keke riders, taxi drivers and car owners who know every junction. Go
              online with one tap, accept the trips you want, and keep 85% of every fare.
            </p>
            <ul className="ride-check">
              <li>Valid Liberian driver's licence</li>
              <li>National ID</li>
              <li>Roadworthy, registered vehicle with plates</li>
              <li>Android or iPhone smartphone</li>
            </ul>
            <a className="rr-link" href="#get-app">
              <ArrowCircle /> Apply to drive with Lizor
            </a>
          </div>
          <div className="rr-drivers__vertical" aria-hidden>
            <span>Lizor</span>
            <span>Driver</span>
          </div>
        </section>

        <section className="rr-section rr-earn-wrap">
          <div className="ride-earn" data-reveal aria-label="Earnings estimator">
            <h3>Estimate your weekly earnings</h3>
            <div className="ride-earn__classes" role="radiogroup" aria-label="Vehicle">
              {RIDE_CLASSES.map((c) => (
                <button key={c.id} type="button" role="radio" aria-checked={driveCls === c.id} className={driveCls === c.id ? "is-active" : ""} onClick={() => setDriveCls(c.id)}>
                  <span aria-hidden>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
            <label className="ride-earn__slider">
              <span>Trips per day <strong>{tripsPerDay}</strong></span>
              <input type="range" min={2} max={30} value={tripsPerDay} onChange={(e) => setTripsPerDay(Number(e.target.value))} />
            </label>
            <label className="ride-earn__slider">
              <span>Days per week <strong>{daysPerWeek}</strong></span>
              <input type="range" min={1} max={7} value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value))} />
            </label>
            <div className="ride-earn__result">
              <span>You could earn</span>
              <strong>{formatLrdWhole(weekly)}</strong>
              <small>per week, after Lizor's 15% fee</small>
            </div>
            <p className="ride-earn__note">Illustrative: average trip ≈ {formatLrdWhole(avgTrip)}. Actual earnings depend on demand, hours and fuel costs.</p>
          </div>
        </section>

        {/* Dark stats with bars */}
        <section className="rr-rules" aria-label="How Lizor works for riders and drivers">
          <div className="rr-rules__inner">
            <div className="rr-rules__top" data-reveal>
              <div><strong>L$ 150</strong><span>lowest fare — a short keke hop</span></div>
              <div><strong>3</strong><span>ways to ride: Keke, Taxi, Comfort</span></div>
              <div><strong>0</strong><span>haggling at the roadside</span></div>
            </div>
            <h2 data-reveal>Every Lizor ride is built on three rules:</h2>
            <div className="rr-rules__bars">
              {rules.map((r) => (
                <div className="rr-rule" key={r.title} data-reveal>
                  <div className="rr-rule__bar" aria-hidden>
                    <span style={{ height: `${r.pct}%` }} />
                  </div>
                  <div>
                    <strong>{r.pct}%</strong>
                    <p>{r.title}</p>
                    <small>↓ {r.foot}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety */}
        <section className="rr-safety" id="safety">
          <div className="rr-safety__inner">
            <div className="rr-safety__copy" data-reveal>
              <h2>Our commitment to safety</h2>
              <p>
                A ride means nothing if it isn't safe. Every Lizor driver is verified in person, every pickup is
                confirmed with a PIN, and every trip can be shared with the people who care about you.
              </p>
              <ul>
                <li>Licence, national ID and vehicle checked before a driver goes online</li>
                <li>4-digit pickup PIN and plate check on every ride</li>
                <li>One-tap trip sharing with family</li>
                <li>Two-way ratings, reviewed by our team</li>
              </ul>
              <a className="rr-link rr-link--light" href="#faq">
                <ArrowCircle /> Read our rider FAQ
              </a>
            </div>
            <div className="rr-safety__photo" data-reveal>
              <img src="/images/family.png" alt="Children playing with a toy car at home in Liberia" />
            </div>
          </div>
          <span className="rr-safety__stripe" aria-hidden />
        </section>

        {/* Diaspora → send money */}
        <section className="rr-diaspora" data-reveal>
          <div>
            <h2 className="rr-h2">In the U.S.? Book a ride for family in Monrovia.</h2>
            <p>
              Book a trip for your mother to the hospital or for your cousin from the airport. Enter their name and number,
              and follow the trip from your phone. Need to send money as well? It's in the same app.
            </p>
          </div>
          <div className="rr-diaspora__actions">
            <button className="btn-blue btn-blue--square" type="button" onClick={() => go("book")}>
              Book for someone
            </button>
            <Link className="rr-link" to={SEND_PATH} onClick={() => window.scrollTo({ top: 0 })}>
              <ArrowCircle /> Send money home
            </Link>
          </div>
        </section>

        {/* Coverage */}
        <section className="rr-section" id="coverage">
          <h2 className="rr-h2" data-reveal>Across Greater Monrovia — and out to RIA</h2>
          <div className="ride-coverage" data-reveal>
            {coverage.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="rr-section" id="faq">
          <h2 className="rr-h2" data-reveal>Questions, answered</h2>
          <div className="ride-faq" data-reveal>
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Get the app */}
        <section className="rr-getapp" id="get-app" data-reveal>
          <div>
            <h2>Your next ride is a tap away.</h2>
            <p>Lizor Ride is in the Lizor app — the same app you use to send money to Liberia.</p>
          </div>
          <div className="ride-getapp__badges">
            <span className="ride-badge"><small>Coming soon on</small>App Store</span>
            <span className="ride-badge"><small>Coming soon on</small>Google Play</span>
          </div>
        </section>
      </main>

      <SiteFooter disclaimer="Lizor Ride connects riders with independent drivers in Greater Monrovia. Fares shown on this site are estimates. Lizor is a financial technology company, not a bank; money transmission services may be provided by licensed partners." />
    </div>
  );
}
