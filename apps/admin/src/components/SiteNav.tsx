import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Product = "ride" | "send";

export const RIDE_PATH = "/";
export const SEND_PATH = "/send";

/**
 * Public site header. Lizor public site header. Two top-level product tabs — Ride first (home), then Send Money.
 */
export function SiteNav({
  active,
  links,
  primaryCta,
}: {
  active: Product;
  links: { href: string; label: string }[];
  primaryCta: { label: string; onClick: () => void };
}) {
  const navigate = useNavigate();
  const top = () => window.scrollTo({ top: 0 });

  return (
    <header className="rapid-nav">
      <div className="rapid-nav__inner">
        <div className="rapid-nav__left">
          <Link className="rapid-wordmark" to={RIDE_PATH} onClick={top} aria-label="Lizor home">
            <LizorMark size={34} />
            <span>LIZOR</span>
          </Link>
          <nav className="rapid-product-tabs" aria-label="Lizor products">
            <Link
              to={RIDE_PATH}
              className={"rapid-product-tab" + (active === "ride" ? " is-active" : "")}
              aria-current={active === "ride" ? "page" : undefined}
              onClick={top}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 16v2.5M19 16v2.5M4 16h16v-4l-2-5H6l-2 5v4zM4 12h16"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Ride
            </Link>
            <Link
              to={SEND_PATH}
              className={"rapid-product-tab" + (active === "send" ? " is-active" : "")}
              aria-current={active === "send" ? "page" : undefined}
              onClick={top}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Send Money
            </Link>
          </nav>
        </div>

        <nav className="rapid-nav__links" aria-label="On this page">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="rapid-nav__actions">
          <button className="rapid-link-button" type="button" onClick={() => navigate("/dashboard")}>
            Log In
          </button>
          <button className="rapid-button rapid-button--small" type="button" onClick={primaryCta.onClick}>
            {primaryCta.label}
          </button>
        </div>
      </div>
    </header>
  );
}

export function ArrowCircle() {
  return (
    <svg className="arrow-circle" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 20h15M21 14l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

let markCount = 0;
/** Lizor gecko mark. */
export function LizorMark({ size = 44 }: { size?: number }) {
  const [uid] = useState(() => ++markCount);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
  <defs>
    <linearGradient id={`lz-${uid}`} x1="44" y1="4" x2="22" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#38bdf8"/>
      <stop offset="0.45" stopColor="#3b82f6"/>
      <stop offset="1" stopColor="#1d4ed8"/>
    </linearGradient>
  </defs>
  <g stroke={`url(#lz-${uid})`} strokeLinecap="round" strokeLinejoin="round">
    {/* bent legs (running gait) */}
    <path d="M35 19 L26.5 15.5 L24 8.5" strokeWidth="3.4"/>
    <path d="M38.5 23 L46.5 25 L50 18.5" strokeWidth="3.4"/>
    <path d="M30.5 34.5 L22 35 L17.5 41" strokeWidth="3.4"/>
    <path d="M33.5 38 L40 43.5 L39.5 51" strokeWidth="3.4"/>
    {/* torso */}
    <path d="M38.5 15 C36 23 33 30 31.5 38" strokeWidth="10.5"/>
    {/* tapering tail */}
    <path d="M31.5 38 C30 43 28 46 25 49" strokeWidth="6.5"/>
    <path d="M25 49 C21.5 53 22 58.5 27.5 59.5" strokeWidth="4.4"/>
    <path d="M27.5 59.5 C32 60.2 35 57.5 34 54.5" strokeWidth="2.6"/>
  </g>
  <g fill={`url(#lz-${uid})`}>
    {/* splayed toes */}
    <circle cx="23.6" cy="7.4" r="2"/><circle cx="50.6" cy="17.4" r="2"/>
    <circle cx="16.8" cy="42" r="2"/><circle cx="39.4" cy="52.2" r="2"/>
    {/* head: broad gecko head, turned up-right */}
    <ellipse cx="40.4" cy="9.8" rx="5.6" ry="7" transform="rotate(17 40.4 9.8)"/>
    <circle cx="37.2" cy="7" r="2.3"/>
    <circle cx="43.9" cy="9" r="2.3"/>
  </g>
  {/* eyes + dorsal spots */}
  <circle cx="37" cy="6.6" r="1.25" fill="#fff"/>
  <circle cx="44.1" cy="8.6" r="1.25" fill="#fff"/>
  <circle cx="36.9" cy="6.4" r="0.55" fill="#0a1630"/>
  <circle cx="44.2" cy="8.4" r="0.55" fill="#0a1630"/>
  <circle cx="36.6" cy="22.5" r="1.25" fill="#dbeafe"/>
  <circle cx="34.9" cy="27.8" r="1.25" fill="#dbeafe"/>
  <circle cx="33.4" cy="33" r="1.25" fill="#dbeafe"/>
</svg>
  );
}

export function SiteFooter({ disclaimer }: { disclaimer: string }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <LizorMark size={56} />
          <span>LIZOR</span>
        </div>
        <div className="site-footer__grid">
          <nav aria-label="Lizor Ride">
            <Link to={RIDE_PATH}>Lizor Ride</Link>
            <a href={`${RIDE_PATH}#drive`}>Drive with Lizor</a>
            <a href={`${RIDE_PATH}#safety`}>Safety</a>
            <a href={`${RIDE_PATH}#faq`}>FAQ</a>
            <a href={`${RIDE_PATH}#coverage`}>Where we go</a>
          </nav>
          <nav aria-label="Company">
            <Link to={SEND_PATH}>Send Money</Link>
            <Link to="/dashboard">Operations login</Link>
            <a href="#top">Privacy Policy</a>
            <a href="#top">Terms</a>
            <a href="#top">Contact Us</a>
          </nav>
          <div className="site-footer__signup">
            <p>Get the latest on Lizor and where we're launching next.</p>
            <a className="btn-blue" href={`${RIDE_PATH}#get-app`}>
              Get the app
            </a>
            <label className="site-footer__lang">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <span className="sr-only">Language</span>
              <select defaultValue="en">
                <option value="en">English</option>
              </select>
            </label>
          </div>
        </div>
        <p className="site-footer__fine">{disclaimer}</p>
      </div>
    </footer>
  );
}
