import { Link, useNavigate } from "react-router-dom";

type Product = "ride" | "send";

export const RIDE_PATH = "/";
export const SEND_PATH = "/send";

/**
 * Public site header. Two top-level product tabs — Ride first (home), then Send Money.
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
          <Link className="rapid-wordmark" to={RIDE_PATH} onClick={top} aria-label="Rapid home">
            RAPID
          </Link>
          <nav className="rapid-product-tabs" aria-label="Rapid products">
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

export function RapidMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="rm-g" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="#1d4ed8" />
          <stop offset="0.55" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>
      <path d="M8 38 L20 10 M20 10 L30 26 M30 26 L40 10" stroke="url(#rm-g)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SiteFooter({ disclaimer }: { disclaimer: string }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <RapidMark />
        <div className="site-footer__grid">
          <nav aria-label="Rapid Ride">
            <Link to={RIDE_PATH}>Rapid Ride</Link>
            <a href={`${RIDE_PATH}#drive`}>Drive with Rapid</a>
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
            <p>Get the latest on Rapid and where we're launching next.</p>
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
