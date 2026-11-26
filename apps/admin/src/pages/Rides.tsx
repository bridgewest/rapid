import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "../lib/api";

type Ride = {
  id: string;
  status: string;
  vehicleClass: string;
  paymentMethod: string;
  pickupLabel: string;
  dropoffLabel: string;
  distanceKm: number;
  fareEstimateLrd: number;
  fareFinalLrd: number | null;
  riderRating: number | null;
  requestedAt: string;
  rider: { email: string; phoneE164: string };
  driver: { fullName: string; plateNumber: string; vehicleClass: string } | null;
};

type Summary = {
  driversOnline: number;
  driversPending: number;
  activeRides: number;
  completedToday: number;
  grossFareTodayLrd: number;
};

const ACTIVE = ["REQUESTED", "DRIVER_ASSIGNED", "DRIVER_ARRIVED", "IN_PROGRESS"];

function rideBadge(s: string) {
  if (s === "COMPLETED") return "badge badge--success";
  if (ACTIVE.includes(s)) return "badge badge--warn";
  if (s.startsWith("CANCELLED") || s === "NO_DRIVERS") return "badge badge--danger";
  return "badge badge--neutral";
}

const lrd = (n: number) => `L$${n.toLocaleString("en-US")}`;
const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  return m < 1 ? "just now" : m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : new Date(iso).toLocaleDateString();
};

export function Rides() {
  const [rows, setRows] = useState<Ride[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlyActive, setOnlyActive] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      adminFetch("/admin/rides").then((r) => (r.ok ? r.json() : [])),
      adminFetch("/admin/rides/summary").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([list, sum]) => {
        setRows(list);
        setSummary(sum);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10_000);
    return () => clearInterval(t);
  }, [load]);

  const shown = onlyActive ? rows.filter((r) => ACTIVE.includes(r.status)) : rows;

  return (
    <>
      <header className="page-header">
        <p className="page-header__eyebrow">Rapid Ride</p>
        <h1 className="page-header__title">Live trips</h1>
        <p className="page-header__desc">Requests, trips in progress and completed rides across Greater Monrovia. Refreshes every 10 seconds.</p>
      </header>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-card__label">Drivers online</div>
          <div className="metric-card__value">{summary?.driversOnline ?? "…"}</div>
          <div className="metric-card__hint">{summary ? `${summary.driversPending} awaiting approval` : " "}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Active trips</div>
          <div className="metric-card__value">{summary?.activeRides ?? "…"}</div>
          <div className="metric-card__hint">Requested → in progress</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Completed today</div>
          <div className="metric-card__value">{summary?.completedToday ?? "…"}</div>
          <div className="metric-card__hint">Since midnight (server time)</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Gross fares today</div>
          <div className="metric-card__value" style={{ fontSize: "1.5rem" }}>{summary ? lrd(summary.grossFareTodayLrd) : "…"}</div>
          <div className="metric-card__hint">15% platform take</div>
        </div>
      </div>

      <div className="seg-control">
        <button className={"seg-control__btn" + (!onlyActive ? " is-active" : "")} onClick={() => setOnlyActive(false)}>All trips</button>
        <button className={"seg-control__btn" + (onlyActive ? " is-active" : "")} onClick={() => setOnlyActive(true)}>Active only</button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Requested</th>
              <th>Route</th>
              <th>Status</th>
              <th>Driver</th>
              <th>Rider</th>
              <th className="num">Fare</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6}><div className="empty-state">Loading trips…</div></td></tr>
            )}
            {!loading && shown.length === 0 && (
              <tr><td colSpan={6}><div className="empty-state">No trips yet.</div></td></tr>
            )}
            {shown.map((r) => (
              <tr key={r.id}>
                <td style={{ whiteSpace: "nowrap", color: "var(--text-secondary)" }}>{ago(r.requestedAt)}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{r.pickupLabel} → {r.dropoffLabel}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>
                    {r.vehicleClass} · {r.distanceKm} km · {r.paymentMethod.replace("_", " ").toLowerCase()}
                    {r.riderRating != null && ` · ★ ${r.riderRating}`}
                  </div>
                </td>
                <td><span className={rideBadge(r.status)}>{r.status.replace(/_/g, " ")}</span></td>
                <td>{r.driver ? <>{r.driver.fullName} <code>{r.driver.plateNumber}</code></> : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                <td style={{ color: "var(--text-secondary)" }}>{r.rider.phoneE164}</td>
                <td className="num" style={{ fontWeight: 600 }}>{lrd(r.fareFinalLrd ?? r.fareEstimateLrd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
