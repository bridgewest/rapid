import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiteFooter, SiteNav } from "../components/SiteNav";

const EXCHANGE_RATE = 192;
const TRANSFER_FEE_RATE = 0.015;

const deliveryOptions = [
  { id: "mobile", label: "Mobile money", detail: "Orange or MTN Liberia" },
  { id: "bank", label: "Bank deposit", detail: "Deposit to local bank" },
  { id: "cash", label: "Cash pickup", detail: "Partner counter pickup" },
] as const;

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
      <SiteNav
        active="send"
        links={[
          { href: "#send", label: "Send Money" },
          { href: "#rates", label: "Rates" },
          { href: "#how", label: "How It Works" },
          { href: "#security", label: "Security" },
          { href: "#help", label: "Help" },
        ]}
        primaryCta={{ label: "Start a Transfer", onClick: goToDashboard }}
      />

      <main>
        <section className="rapid-hero" id="send">
          <div className="rapid-hero__copy" data-reveal>
            <span className="rapid-kicker">U.S. to Liberia money movement</span>
            <h1>Send money from the U.S. to Liberia with clarity and control.</h1>
            <p>
              Rapid helps families fund transfers, airtime, and everyday support with transparent fees,
              USD to LRD estimates, and status tracking from confirmation to delivery.
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

      <SiteFooter disclaimer="Rapid is a financial technology company, not a bank. Money transmission services may be provided by licensed partners. All transfers are subject to review." />
    </div>
  );
}
