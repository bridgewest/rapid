import { Link, useNavigate } from "react-router-dom";

type Product = "send" | "ride";

/**
 * Public site header. Two top-level product tabs:
 *   Send Money (remittance, "/")  ·  Ride (ride-hailing, "/ride")
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

  return (
    <header className={"rapid-nav" + (active === "ride" ? " rapid-nav--ride" : "")}>
      <div className="rapid-nav__inner">
        <div className="rapid-nav__left">
          <Link className="rapid-brand" to={active === "ride" ? "/ride" : "/"} onClick={() => window.scrollTo({ top: 0 })}>
            Rapid
          </Link>
          <nav className="rapid-product-tabs" aria-label="Rapid products">
            <Link
              to="/"
              className={"rapid-product-tab" + (active === "send" ? " is-active" : "")}
              aria-current={active === "send" ? "page" : undefined}
              onClick={() => window.scrollTo({ top: 0 })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Send Money
            </Link>
            <Link
              to="/ride"
              className={"rapid-product-tab" + (active === "ride" ? " is-active" : "")}
              aria-current={active === "ride" ? "page" : undefined}
              onClick={() => window.scrollTo({ top: 0 })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 16v2.5M19 16v2.5M4 16h16v-4l-2-5H6l-2 5v4zM4 12h16"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="8" cy="14" r="0.6" fill="currentColor" stroke="currentColor" />
                <circle cx="16" cy="14" r="0.6" fill="currentColor" stroke="currentColor" />
              </svg>
              Ride
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
