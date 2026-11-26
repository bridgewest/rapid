import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const EXCHANGE_RATE = 192;
const TRANSFER_FEE_RATE = 0.015;

const deliveryOptions = [
  { id: "mobile", label: "Mobile money", detail: "Orange or MTN Liberia" },
  { id: "bank", label: "Bank deposit", detail: "Deposit to local bank" },
  { id: "cash", label: "Cash pickup", detail: "Partner counter pickup" },
] as const;

/** Mirrors apps/api/src/services/rides.ts FARE_TABLE — illustrative only. */
const RIDE_CLASSES = [
  { id: "KEKE", label: "Keke", icon: "🛺", base: 100, perKm: 40, perMin: 5, min: 150 },
  { id: "TAXI", label: "Taxi", icon: "🚕", base: 200, perKm: 70, perMin: 8, min: 300 },
  { id: "COMFORT", label: "Comfort", icon: "🚙", base: 400, perKm: 120, perMin: 12, min: 600 },
] as const;

const RIDE_PLACES = [
  { label: "Broad Street", lat: 6.3156, lng: -10.8074 },
  { label: "Capitol Hill", lat: 6.3046, lng: -10.7935 },
  { label: "JFK Medical Center", lat: 6.2953, lng: -10.7799 },
  { label: "Sinkor", lat: 6.293, lng: -10.777 },
  { label: "Congo Town", lat: 6.278, lng: -10.75 },
  { label: "Red Light Market", lat: 6.2955, lng: -10.715 },
  { label: "ELWA Junction", lat: 6.2416, lng: -10.7047 },
  { label: "Freeport (Bushrod Island)", lat: 6.346, lng: -10.79 },
  { label: "Roberts Intl Airport", lat: 6.2338, lng: -10.3623 },
];

function estimateRide(fromIdx: number, toIdx: number) {
  const a = RIDE_PLACES[fromIdx];
  const b = RIDE_PLACES[toIdx];
  const toRad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(toRad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(toRad(b.lng - a.lng) / 2) ** 2;
  const km = Math.max(0.3, 2 * 6371 * Math.asin(Math.sqrt(h)) * 1.35);
  const min = Math.max(3, Math.round((Math.min(km, 10) / 18 + Math.max(0, km - 10) / 45) * 60));
  return {
    km: Math.round(km * 10) / 10,
    min,
    fares: RIDE_CLASSES.map((c) => ({
      ...c,
      fare: Math.ceil(Math.max(c.min, c.base + c.perKm * km + c.perMin * min) / 25) * 25,
    })),
  };
}

const driverPerks = [
  "Keep 85% of every fare",
  "Drive when you want — go online with one tap",
  "Keke, taxi or private car welcome",
  "Rider PIN check and trip sharing on every ride",
];

const corridorStats = [
  ["Corridor", "USD -> LRD"],
  ["Transfer fee", "1.5%"],
  ["Airtime", "Orange / MTN Liberia"],
  ["Review", "Identity and transfer checks"],
];

const timelineSteps = [
  {
    step: "01",
    title: "Verify once",
    body: "Create a Rapid profile and complete identity checks before your first transfer.",
  },
  {
    step: "02",
    title: "Review the quote",
    body: "See the fee, exchange rate, delivery method, and recipient amount before you confirm.",
  },
  {
    step: "03",
    title: "Track every stage",
    body: "Follow the transfer from funding through review and local delivery in Liberia.",
  },
  {
    step: "04",
    title: "Support arrives",
    body: "Recipients can receive funds by mobile money, bank deposit, or partner pickup.",
  },
];

const securityItems = [
  "Identity checks before high-risk activity",
  "Transfer review for amount and recipient signals",
  "Partner-supported money transmission services",
  "Saved recipients and status history in one app",
];

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(media.matches);
    update();

    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return prefersReduced;
}

function useReveal(prefersReduced: boolean) {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.18 },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [prefersReduced]);
}

function parseAmount(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
}

function formatInputAmount(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatLrd(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function Landing() {
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  useReveal(prefersReducedMotion);

  const [rideFrom, setRideFrom] = useState(1);
  const [rideTo, setRideTo] = useState(6);
  const ride = useMemo(() => estimateRide(rideFrom, rideTo), [rideFrom, rideTo]);

  const [sendAmount, setSendAmount] = useState("1,000.00");
  const [delivery, setDelivery] = useState<(typeof deliveryOptions)[number]["id"]>("mobile");
  const amountUsd = useMemo(() => parseAmount(sendAmount), [sendAmount]);
  const feeUsd = amountUsd * TRANSFER_FEE_RATE;
  const targetReceiveLrd = amountUsd * EXCHANGE_RATE;
  const [displayedReceiveLrd, setDisplayedReceiveLrd] = useState(targetReceiveLrd);
  const displayedReceiveRef = useRef(targetReceiveLrd);

  useEffect(() => {
    if (prefersReducedMotion) {
      displayedReceiveRef.current = targetReceiveLrd;
      setDisplayedReceiveLrd(targetReceiveLrd);
      return;
    }

    const startValue = displayedReceiveRef.current;
    const delta = targetReceiveLrd - startValue;
    const startedAt = performance.now();
    const duration = 420;
    let frameId = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + delta * eased;

      displayedReceiveRef.current = nextValue;
      setDisplayedReceiveLrd(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [prefersReducedMotion, targetReceiveLrd]);

  const selectedDelivery = deliveryOptions.find((option) => option.id === delivery) ?? deliveryOptions[0];

  const handleAmountChange = (value: string) => {
    if (/^[0-9,]*\.?[0-9]{0,2}$/.test(value)) {
      setSendAmount(value);
    }
  };

  const handleAmountBlur = () => {
    setSendAmount(formatInputAmount(amountUsd));
  };

  const goToDashboard = () => navigate("/dashboard");

  return (
    <div className="rapid-landing">
      <header className="rapid-nav">
        <div className="rapid-nav__inner">
          <button
            className="rapid-brand"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })}
          >
            Rapid
          </button>
          <nav className="rapid-nav__links" aria-label="Primary navigation">
            <a href="#ride">Ride</a>
            <a href="#send">Send Money</a>
            <a href="#rates">Rates</a>
            <a href="#how">How It Works</a>
            <a href="#security">Security</a>
            <a href="#help">Help</a>
          </nav>
          <div className="rapid-nav__actions">
            <button className="rapid-link-button" type="button" onClick={goToDashboard}>
              Log In
            </button>
            <button className="rapid-button rapid-button--small" type="button" onClick={goToDashboard}>
              Start a Transfer
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="rapid-hero" id="send">
          <div className="rapid-hero__copy" data-reveal>
            <span className="rapid-kicker">U.S. to Liberia money movement</span>
            <h1>Send money from the U.S. to Liberia with clarity and control.</h1>
            <p>
              Rapid helps families fund transfers, airtime, and everyday support with transparent fees,
              USD to LRD estimates, and status tracking from confirmation to delivery — and now gets
              you around Monrovia with <a href="#ride">Rapid Ride</a>.
            </p>
            <div className="rapid-hero__actions">
              <button className="rapid-button" type="button" onClick={goToDashboard}>
                Start a Transfer
              </button>
              <button className="rapid-button rapid-button--ghost" type="button" onClick={goToDashboard}>
                Track a Transfer
              </button>
            </div>
            <dl className="rapid-proof-grid" aria-label="Rapid corridor details">
              <div>
                <dt>Primary corridor</dt>
                <dd>United States to Liberia</dd>
              </div>
              <div>
                <dt>Supported needs</dt>
                <dd>Remittance and airtime</dd>
              </div>
            </dl>
          </div>

          <aside className="rapid-quote-card" aria-label="Illustrative transfer quote" data-reveal>
            <div className="rapid-quote-card__topline">
              <span>Illustrative quote</span>
              <span>USD &gt; LRD</span>
            </div>

            <label className="rapid-field">
              <span>You send</span>
              <input
                inputMode="decimal"
                value={sendAmount}
                onBlur={handleAmountBlur}
                onChange={(event) => handleAmountChange(event.target.value)}
                aria-label="Amount to send in U.S. dollars"
              />
            </label>

            <div className="rapid-segmented" role="radiogroup" aria-label="Delivery method">
              {deliveryOptions.map((option) => (
                <button
                  className={option.id === delivery ? "is-active" : ""}
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={option.id === delivery}
                  onClick={() => setDelivery(option.id)}
                >
                  <span>{option.label}</span>
                  <small>{option.detail}</small>
                </button>
              ))}
            </div>

            <div className="rapid-receive-panel">
              <span>Recipient gets</span>
              <strong aria-live="polite">L$ {formatLrd(displayedReceiveLrd)}</strong>
              <small>Estimate based on 1 USD = {EXCHANGE_RATE.toFixed(2)} LRD.</small>
            </div>

            <div className="rapid-fee-list">
              <div>
                <span>Transfer amount</span>
                <strong>{formatUsd(amountUsd)}</strong>
              </div>
              <div>
                <span>Rapid fee</span>
                <strong>{formatUsd(feeUsd)}</strong>
              </div>
              <div>
                <span>Delivery</span>
                <strong>{selectedDelivery.label}</strong>
              </div>
              <div>
                <span>Total to fund</span>
                <strong>{formatUsd(amountUsd + feeUsd)}</strong>
              </div>
            </div>

            <p className="rapid-review-note">
              All transfers are subject to identity, partner, and compliance review before release.
            </p>
          </aside>
        </section>

        <section className="rapid-strip" id="rates" data-reveal>
          {corridorStats.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>

        <section className="rapid-section rapid-section--split rapid-ride" id="ride">
          <div className="rapid-section__intro" data-reveal>
            <span className="rapid-kicker">Rapid Ride · Monrovia</span>
            <h2>Get around Monrovia with a price you know before you go.</h2>
            <p>
              Book a keke, taxi or comfort car from your phone. See the fare up front, share your trip
              with family, and pay cash or mobile money. Booking for family in Liberia from abroad? You can
              do that too.
            </p>
            <ul className="rapid-ride__bullets">
              <li>Fixed fare shown before you request</li>
              <li>Verified drivers, plate check and 4-digit pickup PIN</li>
              <li>Pickup by landmark — no street address needed</li>
            </ul>
          </div>

          <aside className="rapid-quote-card" aria-label="Illustrative ride fare" data-reveal>
            <div className="rapid-quote-card__topline">
              <span>Fare estimate</span>
              <span>LRD</span>
            </div>
            <label className="rapid-field">
              <span>From</span>
              <select value={rideFrom} onChange={(e) => setRideFrom(Number(e.target.value))}>
                {RIDE_PLACES.map((p, i) => (
                  <option key={p.label} value={i}>{p.label}</option>
                ))}
              </select>
            </label>
            <label className="rapid-field">
              <span>To</span>
              <select value={rideTo} onChange={(e) => setRideTo(Number(e.target.value))}>
                {RIDE_PLACES.map((p, i) => (
                  <option key={p.label} value={i}>{p.label}</option>
                ))}
              </select>
            </label>
            <div className="rapid-fee-list">
              {rideFrom === rideTo ? (
                <div>
                  <span>Choose two different places</span>
                  <strong>—</strong>
                </div>
              ) : (
                ride.fares.map((f) => (
                  <div key={f.id}>
                    <span>{f.icon} {f.label}</span>
                    <strong>L$ {f.fare.toLocaleString("en-US")}</strong>
                  </div>
                ))
              )}
            </div>
            <p className="rapid-review-note">
              About {ride.km} km · {ride.min} min. Estimate only — final fare is shown in the app before you book.
            </p>
          </aside>
        </section>

        <section className="rapid-cta rapid-drive" id="drive" data-reveal>
          <div>
            <span className="rapid-kicker">Drive with Rapid</span>
            <h2>Own a keke or car? Earn with Rapid on your schedule.</h2>
            <ul className="rapid-ride__bullets">
              {driverPerks.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div className="rapid-cta__actions">
            <button className="rapid-button" type="button" onClick={() => document.getElementById("help")?.scrollIntoView()}>
              Apply in the app
            </button>
          </div>
        </section>

        <section className="rapid-section rapid-section--split" id="how">
          <div className="rapid-section__intro" data-reveal>
            <span className="rapid-kicker">How it works</span>
            <h2>Built for transfers that need both speed and review.</h2>
            <p>
              Rapid keeps the sender, recipient, rate, fee, and delivery status visible at every step.
            </p>
          </div>
          <div className="rapid-timeline" data-reveal>
            {timelineSteps.map((item) => (
              <article className="rapid-timeline__item" key={item.step}>
                <span>{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rapid-image-section" aria-label="Rapid customer and team moments">
          <article className="rapid-image-card rapid-image-card--large" data-reveal>
            <img src="/images/sender-asian.png" alt="Asian American Rapid customer in the United States checking a transfer status on a phone" />
            <div>
              <span>Sender view</span>
              <h2>Start from the U.S. with the quote in front of you.</h2>
              <p>
                Confirm the amount, delivery method, fee, and recipient details before the transfer moves.
              </p>
            </div>
          </article>

          <div className="rapid-image-stack">
            <article className="rapid-image-card" data-reveal>
              <img src="/images/family.png" alt="Family in Liberia receiving a transfer notification at home" />
              <div>
                <span>Recipient view</span>
                <h3>Funds arrive where support is needed.</h3>
              </div>
            </article>
            <article className="rapid-image-card" data-reveal>
              <img src="/images/team-diverse.png" alt="Asian, white, and Black Rapid operations teammates reviewing transfer support in a professional workspace" />
              <div>
                <span>Diverse operations team</span>
                <h3>Human review supports safer money movement.</h3>
              </div>
            </article>
          </div>
        </section>

        <section className="rapid-section rapid-section--security" id="security">
          <div className="rapid-phone" data-reveal aria-label="Rapid app preview">
            <div className="rapid-phone__bar">
              <span>Rapid</span>
              <span>Live</span>
            </div>
            <div className="rapid-phone__amount">L$ {formatLrd(displayedReceiveLrd)}</div>
            <div className="rapid-phone__status">
              <span className="is-complete">Quote reviewed</span>
              <span className="is-active">Transfer in review</span>
              <span>Recipient delivery</span>
            </div>
          </div>

          <div className="rapid-security-copy" data-reveal>
            <span className="rapid-kicker">Security and compliance</span>
            <h2>Clear controls before money leaves the sender.</h2>
            <p>
              Rapid is a financial technology company. Money transmission services may be provided by
              licensed partners, and transfers can require additional review.
            </p>
            <ul>
              {securityItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rapid-cta" id="help" data-reveal>
          <div>
            <span className="rapid-kicker">Ready when you are</span>
            <h2>Send support home with a quote you can read before you commit.</h2>
          </div>
          <div className="rapid-cta__actions">
            <button className="rapid-button" type="button" onClick={goToDashboard}>
              Start a Transfer
            </button>
            <button className="rapid-button rapid-button--ghost" type="button" onClick={goToDashboard}>
              Open Dashboard
            </button>
          </div>
        </section>
      </main>

      <footer className="rapid-footer">
        <div>
          <strong>Rapid</strong>
          <p>
            Rapid is a financial technology company, not a bank. Money transmission services may be
            provided by licensed partners. All transfers are subject to review.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#send">Terms</a>
          <a href="#send">Privacy</a>
          <a href="#help">Support</a>
          <a href="#security">Licenses</a>
        </nav>
      </footer>
    </div>
  );
}
