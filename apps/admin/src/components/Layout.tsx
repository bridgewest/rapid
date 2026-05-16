import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { adminFetch } from "../lib/api";

export function Layout() {
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    adminFetch("/health")
      .then((r) => setApiOk(r.ok))
      .catch(() => setApiOk(false));
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    "app-sidebar__link" + (isActive ? " app-sidebar__link--active" : "");

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__logo">DukorPay</span>
          <span className="app-header__tagline">Institutional Operations</span>
        </div>
        <div className="app-header__right">
          <span className="app-header__pill" title="Corridor">
            U.S. — Liberia corridor
          </span>
          <span className="app-header__pill">
            {apiOk === null && "Checking services…"}
            {apiOk === true && "Core API online"}
            {apiOk === false && "API unreachable"}
          </span>
        </div>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <div className="app-sidebar__label">Navigate</div>
          <nav className="app-sidebar__nav">
            <NavLink to="/" end className={linkClass}>
              Overview
            </NavLink>
            <NavLink to="/transactions" className={linkClass}>
              Transfers & activity
            </NavLink>
            <NavLink to="/kyc" className={linkClass}>
              Identity verification
            </NavLink>
            <NavLink to="/analytics" className={linkClass}>
              Revenue & volume
            </NavLink>
            <NavLink to="/aml" className={linkClass}>
              Compliance & AML
            </NavLink>
          </nav>
        </aside>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
