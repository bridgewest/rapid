import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "../lib/api";

type Driver = {
  id: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
  fullName: string;
  licenseNumber: string;
  nationalId: string | null;
  vehicleClass: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleYear: number | null;
  plateNumber: string;
  isOnline: boolean;
  lastLocationAt: string | null;
  ratingAvg: number;
  tripsCount: number;
  createdAt: string;
  user: { email: string; phoneE164: string };
};

const FILTERS = ["PENDING", "APPROVED", "SUSPENDED", "REJECTED", ""] as const;

function driverBadge(status: Driver["status"]) {
  return (
    "badge " +
    (status === "APPROVED" ? "badge--success" : status === "PENDING" ? "badge--warn" : status === "REJECTED" ? "badge--danger" : "badge--neutral")
  );
}

function isLive(d: Driver) {
  return d.isOnline && d.lastLocationAt && Date.now() - new Date(d.lastLocationAt).getTime() < 2 * 60_000;
}

export function Drivers() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("PENDING");
  const [rows, setRows] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminFetch(`/admin/drivers${filter ? `?status=${filter}` : ""}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(load, [load]);

  const decide = async (d: Driver, decision: "APPROVED" | "REJECTED" | "SUSPENDED") => {
    let notes: string | undefined;
    if (decision !== "APPROVED") {
      const input = window.prompt(`Reason for ${decision.toLowerCase()} (shown to the driver):`);
      if (input === null) return;
      notes = input || undefined;
    } else if (!window.confirm(`Approve ${d.fullName} (${d.plateNumber})? Confirm licence and vehicle were inspected in person.`)) {
      return;
    }
    setBusyId(d.id);
    setError(null);
    const r = await adminFetch(`/admin/drivers/${d.id}/decide`, { method: "POST", body: JSON.stringify({ decision, notes }) });
    if (!r.ok) setError((await r.json().catch(() => null))?.error ?? "Action failed");
    setBusyId(null);
    load();
  };

  return (
    <>
      <header className="page-header">
        <p className="page-header__eyebrow">Lizor Ride</p>
        <h1 className="page-header__title">Driver onboarding</h1>
        <p className="page-header__desc">
          Review driver applications. Approve only after the licence, national ID and vehicle (plate, roadworthiness,
          insurance) have been verified in person. Every decision is written to the audit log.
        </p>
      </header>

      <div className="seg-control" role="tablist">
        {FILTERS.map((f) => (
          <button key={f || "all"} role="tab" aria-selected={filter === f} className={"seg-control__btn" + (filter === f ? " is-active" : "")} onClick={() => setFilter(f)}>
            {f ? f[0] + f.slice(1).toLowerCase() : "All"}
          </button>
        ))}
      </div>
      {error && <div className="hint-box" style={{ marginBottom: 16, color: "var(--danger, #dc2626)" }}>{error}</div>}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Vehicle</th>
              <th>Licence / ID</th>
              <th>Status</th>
              <th className="num">Trips · rating</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6}><div className="empty-state">Loading drivers…</div></td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6}><div className="empty-state">No drivers in this view.</div></td>
              </tr>
            )}
            {!loading &&
              rows.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {isLive(d) && <span className="live-dot" title="Online now" />} {d.fullName}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>{d.user.phoneE164} · {d.user.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{d.vehicleClass} · <code>{d.plateNumber}</code></div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>
                      {d.vehicleColor} {d.vehicleMake} {d.vehicleModel} {d.vehicleYear ?? ""}
                    </div>
                  </td>
                  <td style={{ fontSize: "0.8125rem" }}>
                    {d.licenseNumber}
                    {d.nationalId && <div style={{ color: "var(--text-secondary)" }}>{d.nationalId}</div>}
                  </td>
                  <td><span className={driverBadge(d.status)}>{d.status}</span></td>
                  <td className="num">{d.tripsCount} · ★ {d.ratingAvg.toFixed(1)}</td>
                  <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                    {d.status !== "APPROVED" && d.status !== "SUSPENDED" && (
                      <button className="btn btn--primary" disabled={busyId === d.id} onClick={() => decide(d, "APPROVED")}>Approve</button>
                    )}
                    {d.status === "PENDING" && (
                      <button className="btn" disabled={busyId === d.id} onClick={() => decide(d, "REJECTED")}>Reject</button>
                    )}
                    {d.status === "APPROVED" && (
                      <button className="btn btn--danger" disabled={busyId === d.id} onClick={() => decide(d, "SUSPENDED")}>Suspend</button>
                    )}
                    {d.status === "SUSPENDED" && (
                      <button className="btn" disabled={busyId === d.id} onClick={() => decide(d, "APPROVED")}>Reinstate</button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
