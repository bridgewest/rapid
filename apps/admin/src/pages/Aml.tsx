import { useEffect, useState } from "react";
import { adminFetch } from "../lib/api";
import { statusBadgeClass } from "../components/statusBadge";

type AmlRow = {
  id: string;
  severity?: string;
  reason?: string;
  resolved?: boolean;
  amountUsdCents?: number | null;
};

export function Aml() {
  const [rows, setRows] = useState<AmlRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/admin/aml")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: unknown) => setRows(Array.isArray(d) ? (d as AmlRow[]) : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="page-header">
        <p className="page-header__eyebrow">Anti–money laundering</p>
        <h1 className="page-header__title">Compliance flags</h1>
        <p className="page-header__desc">
          Items requiring or warranting compliance review. Resolution should follow your BSA/AML program
          and be documented according to internal policy.
        </p>
      </header>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Reason</th>
              <th>Status</th>
              <th className="num">Amount (USD)</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">Loading flags…</div>
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">No open AML flags.</div>
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className={statusBadgeClass(r.severity ?? "PENDING")}>
                      {(r.severity ?? "—").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", maxWidth: 360 }}>{r.reason ?? "—"}</td>
                  <td>
                    <span className={r.resolved ? "badge badge--neutral" : "badge badge--warn"}>
                      {r.resolved ? "Resolved" : "Open"}
                    </span>
                  </td>
                  <td className="num">
                    {r.amountUsdCents != null
                      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                          r.amountUsdCents / 100,
                        )
                      : "—"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
