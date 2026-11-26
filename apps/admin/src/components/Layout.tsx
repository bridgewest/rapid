import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { adminFetch } from "../lib/api";
import { LizorMark } from "./SiteNav";

function IconOverview() {
  return (
    <svg className="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 13h6V5H4v8zm0 6h6v-4H4v4zm8 0h6v-8h-6v8zm0-14v4h6V5h-6z" fill="currentColor" opacity=".9" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg className="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 11.5L12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTransfer() {
  return (
    <svg className="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 8l4 4-4 4M7 8L3 12l4 4M21 12H9M15 12H3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconKyc() {
  return (
    <svg className="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 20a8 8 0 0116 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChart() {
  return (
    <svg className="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19V5M9 19V9m5 10V7m5 12v-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCar() {
  return (
    <svg className="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 16v2a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-2M5 16h14M5 16v-4l2-5h10l2 5v4M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSteering() {
  return (
    <svg className="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3.5 10h6.5M14 10h6.5M12 14v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Layout() {
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    document.title = "Lizor — Operations Console";
  }, []);

  useEffect(() => {
    adminFetch("/health")
      .then((r) => setApiOk(r.ok))
      .catch(() => setApiOk(false));
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    "app-sidebar__link" + (isActive ? " app-sidebar__link--active" : "");

  return (
    <div className="app-shell">
      <div className="app-accent-strip" aria-hidden="true" />
      <header className="app-header">
        <Link className="app-header__left app-header__home" to="/" aria-label="Open Lizor landing page">
          <div className="app-header__brand">
            <span className="app-header__logo" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><LizorMark size={28} />Lizor</span>
            <span className="app-header__tagline">Operations Console</span>
          </div>
        </Link>
        <div className="app-header__right">
          <span className="app-header__env">Production</span>
          <span className="app-header__pill" title="Corridor">
            <span className="app-header__dot app-header__dot--muted" aria-hidden />
            U.S. — Liberia · Monrovia rides
          </span>
          <span
            className={
              "app-header__pill app-header__pill--status" +
              (apiOk === false ? " app-header__pill--warn" : "") +
              (apiOk === true ? " app-header__pill--ok" : "")
            }
          >
            <span
              className={
                "app-header__dot" +
                (apiOk === null ? "" : apiOk ? " app-header__dot--ok" : " app-header__dot--bad")
              }
              aria-hidden
            />
            {apiOk === null && "Checking API…"}
            {apiOk === true && "API connected"}
            {apiOk === false && "API offline"}
          </span>
        </div>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <div className="app-sidebar__label">Navigation</div>
          <nav className="app-sidebar__nav" aria-label="Main">
            <NavLink to="/" end className={linkClass}>
              <IconHome />
              Landing page
            </NavLink>
            <NavLink to="/dashboard" end className={linkClass}>
              <IconOverview />
              Overview
            </NavLink>
            <NavLink to="/transactions" className={linkClass}>
              <IconTransfer />
              Transfers &amp; activity
            </NavLink>
            <NavLink to="/kyc" className={linkClass}>
              <IconKyc />
              Identity verification
            </NavLink>
            <NavLink to="/analytics" className={linkClass}>
              <IconChart />
              Revenue &amp; volume
            </NavLink>
            <NavLink to="/aml" className={linkClass}>
              <IconShield />
              Compliance &amp; AML
            </NavLink>
          </nav>
          <div className="app-sidebar__label">Lizor Ride</div>
          <nav className="app-sidebar__nav" aria-label="Rides">
            <NavLink to="/rides" className={linkClass}>
              <IconCar />
              Live trips
            </NavLink>
            <NavLink to="/drivers" className={linkClass}>
              <IconSteering />
              Drivers
            </NavLink>
          </nav>
          <div className="app-sidebar__footer">
            <p className="app-sidebar__fineprint">Authorized personnel only. Activity is logged.</p>
            <p className="app-build-stamp" title="Git commit on Vercel (first 7 chars) or local">
              Build {__APP_BUILD_ID__}
            </p>
          </div>
        </aside>
        <main className="app-main">
          <div className="app-main__inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
