import { useEffect, useState } from "react";
import { adminFetch } from "../lib/api";
import { statusBadgeClass } from "../components/statusBadge";

type Row = {
  id: string;
  status: string;
  kind: string;
  sendAmountUsdCents: number;
  publicId?: string;
  user?: { email: string };
};

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function Transactions() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/admin/transactions")
      .then((r) => (r.ok ? r.json() : []))
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="page-header">
        <p className="page-header__eyebrow">Money movement</p>
        <h1 className="page-header__title">Transfers &amp; activity</h1>
        <p className="page-header__desc">
          End-to-end view of customer-initiated remittances, airtime, and bundled transactions. Reference data
          is read-only; institutional actions are audited server-side.
        </p>
      </header>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Status</th>
              <th className="num">Amount (USD)</th>
              <th>Customer</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">Loading activity…</div>
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">
                    No transactions returned — verify API authentication and environment configuration.
                  </div>
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.kind.replace(/_/g, " ")}</td>
                  <td>
                    <span className={statusBadgeClass(r.status)}>{r.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="num" style={{ fontWeight: 600 }}>
                    {formatUsd(r.sendAmountUsdCents)}
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{r.user?.email ?? "—"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
