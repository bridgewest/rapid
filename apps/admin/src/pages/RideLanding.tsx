import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SiteNav } from "../components/SiteNav";
import {
  PLATFORM_TAKE,
  RIDE_CLASSES,
  RIDE_PLACES,
  estimateRide,
  formatLrdWhole,
  type RideClassId,
} from "../lib/rideFares";

const steps = [
  {
    n: "01",
    title: "Set your pickup",
    body: "Use GPS or pick a landmark — “ELWA Junction”, “Red Light”, “JFK”. No street address needed.",
  },
  {
    n: "02",
    title: "See the price first",
    body: "Choose Keke, Taxi or Comfort. Your fare in Liberian dollars is shown before you request.",
  },
  {
    n: "03",
    title: "Match your driver",
    body: "Check the name, photo and plate. Give the driver your 4-digit PIN — the trip can't start without it.",
  },
  {
    n: "04",
    title: "Arrive & pay",
    body: "Pay cash or mobile money at drop-off, then rate your driver. Every trip is saved in your history.",
  },
];

const safety = [
  { title: "Verified drivers", body: "Licence, national ID and vehicle are checked in person before a driver can go online." },
  { title: "4-digit pickup PIN", body: "Only the rider has the PIN. If the plate or PIN doesn't match, don't get in." },
  { title: "Share your trip", body: "Send driver, car and plate details to family with one tap." },
  { title: "Two-way ratings", body: "Riders and drivers rate each other. Low ratings are reviewed by our team." },
];

const coverage = [
  "Central Monrovia",
  "Mamba Point",
  "Capitol Hill",
  "Sinkor",
  "Congo Town",
  "Paynesville",
  "ELWA",
  "Gardnersville",
  "Bushrod Island",
  "New Kru Town",
  "Duport Road",
  "RIA Airport",
];

const faqs = [
  {
    q: "How is the fare calculated?",
    a: "A base fare plus distance and estimated time, depending on the ride type. You see the price before you request. If heavy traffic makes the trip much longer, the fare can rise — never more than 50% above the quote.",
  },
  {
    q: "How do I pay?",
    a: "Cash or mobile money (Orange Money / MTN MoMo) to the driver at drop-off. In-app payment from your Rapid wallet is coming soon.",
  },
  {
    q: "Can I book a ride for my family from the U.S.?",
    a: "Yes. Choose “Booking for someone else”, enter their name and phone number, and the driver will call them at pickup. You can follow the trip from your phone.",
  },
  {
    q: "What's the difference between Keke, Taxi and Comfort?",
    a: "Keke is a tricycle — the cheapest option for short trips. Taxi is a private yellow taxi just for you. Comfort is a newer car or SUV with air conditioning, good for the airport and business trips.",
  },
  {
    q: "How do I become a driver?",
    a: "Download the Rapid app, open Ride → Drive with Rapid, and submit your licence and vehicle details. Then bring your documents and vehicle for inspection. Once approved, you can go online whenever you like.",
  },
];

function Reveal() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);
  return null;
}

export function RideLanding() {
  const [from, setFrom] = useState(3); // Capitol Hill
  const [to, setTo] = useState(9); // ELWA Junction
  const [cls, setCls] = useState<RideClassId>("TAXI");
  const est = useMemo(() => estimateRide(from, to), [from, to]);
  const chosen = est.fares.find((f) => f.id === cls)!;
  const same = from === to;

  // Driver earnings calculator
  const [driveCls, setDriveCls] = useState<RideClassId>("TAXI");
  const [tripsPerDay, setTripsPerDay] = useState(12);
  const [daysPerWeek, setDaysPerWeek] = useState(6);
  const avgTrip = useMemo(() => {
    const c = RIDE_CLASSES.find((r) => r.id === driveCls)!;
    // typical urban trip ≈ 6 km / 20 min
    return Math.ceil(Math.max(c.min, c.base + c.perKm * 6 + c.perMin * 20) / 25) * 25;
  }, [driveCls]);
  const weekly = Math.round(avgTrip * tripsPerDay * daysPerWeek * (1 - PLATFORM_TAKE));

  const toApp = () => document.getElementById("get-app")?.scrollIntoView({ behavior: "smooth" });
  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="rapid-landing rapid-landing--ride">
      <Reveal />
      <SiteNav
        active="ride"
        links={[
          { href: "#book", label: "Book" },
          { href: "#vehicles", label: "Ride Types" },
          { href: "#safety", label: "Safety" },
          { href: "#drive", label: "Drive" },
          { href: "#faq", label: "FAQ" },
        ]}
        primaryCta={{ label: "Get the App", onClick: toApp }}
      />

      <main>
        {/* ── Hero + booking widget ── */}
        <section className="ride-hero" id="book">
          <div className="ride-hero__inner">
            <div className="ride-hero__copy" data-reveal>
              <span className="ride-pill">
                <span className="ride-pill__dot" /> Now in Greater Monrovia
              </span>
              <h1>
                Go anywhere in Monrovia.
                <br />
                <span>Know the price first.</span>
              </h1>
              <p>
                Book a keke, taxi or comfort car in seconds. Upfront fares in Liberian dollars, verified drivers,
                and a pickup PIN on every trip. Pay cash or mobile money.
              </p>
              <div className="ride-hero__stats">
                <div>
                  <strong>3</strong>
                  <span>ride types</span>
                </div>
                <div>
                  <strong>L$</strong>
                  <span>upfront fares</span>
                </div>
                <div>
                  <strong>PIN</strong>
                  <span>on every pickup</span>
                </div>
              </div>
            </div>

            <form className="ride-book" data-reveal onSubmit={(e) => { e.preventDefault(); toApp(); }} aria-label="Fare estimate">
              <h2>Where to?</h2>
              <div className="ride-book__route">
                <label className="ride-book__field">
                  <span className="ride-book__dot ride-book__dot--from" aria-hidden />
                  <span className="sr-only">Pickup</span>
                  <select value={from} onChange={(e) => setFrom(Number(e.target.value))}>
                    {RIDE_PLACES.map((p, i) => (
                      <option key={p.label} value={i}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" className="ride-book__swap" onClick={swap} aria-label="Swap pickup and destination">
                  ⇅
                </button>
                <label className="ride-book__field">
                  <span className="ride-book__dot ride-book__dot--to" aria-hidden />
                  <span className="sr-only">Destination</span>
                  <select value={to} onChange={(e) => setTo(Number(e.target.value))}>
                    {RIDE_PLACES.map((p, i) => (
                      <option key={p.label} value={i}>
                        {p.label}
                      </option>
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
                    <span className="ride-class__icon" aria-hidden>
                      {f.icon}
                    </span>
                    <span className="ride-class__name">
                      {f.label}
                      <small>{f.seats} seats</small>
                    </span>
                    <span className="ride-class__fare">{same ? "—" : formatLrdWhole(f.fare)}</span>
                  </button>
                ))}
              </div>

              <div className="ride-book__meta">
                {same ? "Choose two different places" : `About ${est.km} km · ${est.min} min`}
              </div>
              <button className="ride-book__cta" type="submit" disabled={same}>
                {same ? "Choose a destination" : `Request ${chosen.label} · ${formatLrdWhole(chosen.fare)}`}
              </button>
              <p className="ride-book__note">Estimate only. Your exact fare is confirmed in the app before you book.</p>
            </form>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="ride-section" id="how">
          <div className="ride-section__head" data-reveal>
            <span className="rapid-kicker">How it works</span>
            <h2>From request to drop-off in four steps.</h2>
          </div>
          <div className="ride-steps">
            {steps.map((s) => (
              <article className="ride-step" key={s.n} data-reveal>
                <span className="ride-step__n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Vehicle classes ── */}
        <section className="ride-section" id="vehicles">
          <div className="ride-section__head" data-reveal>
            <span className="rapid-kicker">Ride types</span>
            <h2>A ride for every trip and every budget.</h2>
          </div>
          <div className="ride-vehicles">
            {RIDE_CLASSES.map((c) => (
              <article className={"ride-vehicle ride-vehicle--" + c.id.toLowerCase()} key={c.id} data-reveal>
                <div className="ride-vehicle__icon" aria-hidden>
                  {c.icon}
                </div>
                <h3>{c.label}</h3>
                <p>{c.bestFor}</p>
                <dl>
                  <div>
                    <dt>Seats</dt>
                    <dd>{c.seats}</dd>
                  </div>
                  <div>
                    <dt>From</dt>
                    <dd>{formatLrdWhole(c.min)}</dd>
                  </div>
                  <div>
                    <dt>Per km</dt>
                    <dd>{formatLrdWhole(c.perKm)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        {/* ── Safety ── */}
        <section className="ride-section ride-safety" id="safety">
          <div className="ride-safety__copy" data-reveal>
            <span className="rapid-kicker">Safety</span>
            <h2>Safety built into every trip.</h2>
            <p>Know who is driving you, and make sure the right people know where you are.</p>
            <div className="ride-safety__grid">
              {safety.map((s) => (
                <div key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="ride-phone" data-reveal aria-label="Rapid Ride app preview">
            <div className="ride-phone__screen">
              <div className="ride-phone__map" aria-hidden>
                <svg viewBox="0 0 300 200" preserveAspectRatio="none">
                  <path d="M0 140 C60 120 90 160 150 130 S240 60 300 80" stroke="#cbd5e1" strokeWidth="14" fill="none" />
                  <path d="M40 0 C60 60 50 120 90 200" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                  <path d="M60 150 C110 140 140 120 170 110 S220 90 240 70" stroke="#111827" strokeWidth="4" strokeDasharray="2 8" strokeLinecap="round" fill="none" />
                  <circle cx="60" cy="150" r="8" fill="#16a34a" />
                  <circle cx="240" cy="70" r="8" fill="#dc2626" />
                  <text x="170" y="104" fontSize="22">🚕</text>
                </svg>
              </div>
              <div className="ride-phone__sheet">
                <div className="ride-phone__status">Driver is on the way · 4 min</div>
                <div className="ride-phone__driver">
                  <div className="ride-phone__avatar">JK</div>
                  <div>
                    <strong>Joseph K.</strong>
                    <span>★ 4.9 · Yellow Toyota Corolla</span>
                  </div>
                  <div className="ride-phone__plate">TX-1042</div>
                </div>
                <div className="ride-phone__pin">
                  <span>Your pickup PIN</span>
                  <strong>4 8 1 7</strong>
                </div>
                <div className="ride-phone__actions">
                  <span>Call</span>
                  <span>Share trip</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Diaspora booking (bridges to remittance) ── */}
        <section className="ride-diaspora" data-reveal>
          <div>
            <span className="rapid-kicker">For family abroad</span>
            <h2>In the U.S.? Book a ride for family in Monrovia.</h2>
            <p>
              Book a trip for your mother to the hospital or for your cousin from the airport. Enter their name and
              number, and follow the trip from your phone. Need to send money as well? It's in the same app.
            </p>
          </div>
          <div className="ride-diaspora__actions">
            <button className="rapid-button" type="button" onClick={toApp}>
              Book for someone
            </button>
            <Link className="rapid-button rapid-button--ghost" to="/">
              Send money →
            </Link>
          </div>
        </section>

        {/* ── Drive ── */}
        <section className="ride-section ride-drive" id="drive">
          <div className="ride-drive__copy" data-reveal>
            <span className="rapid-kicker">Drive with Rapid</span>
            <h2>Your keke or car. Your hours. Keep 85%.</h2>
            <p>
              Go online with one tap, accept the trips you want, and see what you'll earn before you accept. Use your
              own vehicle — tricycle, taxi or private car.
            </p>
            <ul className="ride-check">
              <li>Valid Liberian driver's licence</li>
              <li>National ID</li>
              <li>Roadworthy, registered vehicle with plates</li>
              <li>Android or iPhone smartphone</li>
            </ul>
            <button className="rapid-button" type="button" onClick={toApp}>
              Apply to drive
            </button>
          </div>

          <div className="ride-earn" data-reveal aria-label="Earnings estimator">
            <h3>Estimate your weekly earnings</h3>
            <div className="ride-earn__classes" role="radiogroup" aria-label="Vehicle">
              {RIDE_CLASSES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={driveCls === c.id}
                  className={driveCls === c.id ? "is-active" : ""}
                  onClick={() => setDriveCls(c.id)}
                >
                  <span aria-hidden>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
            <label className="ride-earn__slider">
              <span>
                Trips per day <strong>{tripsPerDay}</strong>
              </span>
              <input type="range" min={2} max={30} value={tripsPerDay} onChange={(e) => setTripsPerDay(Number(e.target.value))} />
            </label>
            <label className="ride-earn__slider">
              <span>
                Days per week <strong>{daysPerWeek}</strong>
              </span>
              <input type="range" min={1} max={7} value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value))} />
            </label>
            <div className="ride-earn__result">
              <span>You could earn</span>
              <strong>{formatLrdWhole(weekly)}</strong>
              <small>per week, after Rapid's 15% fee</small>
            </div>
            <p className="ride-book__note">
              Illustrative: average trip ≈ {formatLrdWhole(avgTrip)}. Actual earnings depend on demand, hours and fuel costs.
            </p>
          </div>
        </section>

        {/* ── Coverage ── */}
        <section className="ride-section" id="coverage">
          <div className="ride-section__head" data-reveal>
            <span className="rapid-kicker">Where we go</span>
            <h2>Across Greater Monrovia — and out to RIA.</h2>
          </div>
          <div className="ride-coverage" data-reveal>
            {coverage.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="ride-section" id="faq">
          <div className="ride-section__head" data-reveal>
            <span className="rapid-kicker">FAQ</span>
            <h2>Questions, answered.</h2>
          </div>
          <div className="ride-faq" data-reveal>
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Get the app ── */}
        <section className="ride-getapp" id="get-app" data-reveal>
          <div>
            <h2>Your next ride is a tap away.</h2>
            <p>Rapid Ride is in the Rapid app — the same app you use to send money to Liberia.</p>
          </div>
          <div className="ride-getapp__badges">
            <span className="ride-badge">
              <small>Coming soon on</small>App Store
            </span>
            <span className="ride-badge">
              <small>Coming soon on</small>Google Play
            </span>
          </div>
        </section>
      </main>

      <footer className="rapid-footer">
        <div>
          <strong>Rapid</strong>
          <p>
            Rapid Ride connects riders with independent drivers in Greater Monrovia. Fares on this page are estimates.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/">Send Money</Link>
          <a href="#drive">Drive</a>
          <a href="#safety">Safety</a>
          <a href="#faq">Help</a>
        </nav>
      </footer>
    </div>
  );
}
