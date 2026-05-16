import { useEffect, useState } from "react";
import { adminFetch } from "../lib/api";
import { statusBadgeClass } from "../components/statusBadge";

type Row = { id: string; status: string; user: { email: string } };

export function KycQueue() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/admin/kyc-queue")
      .then((r) => (r.ok ? r.json() : []))
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="page-header">
        <p className="page-header__eyebrow">Know your customer</p>
        <h1 className="page-header__title">Identity verification queue</h1>
        <p className="page-header__desc">
          Submissions awaiting operations review in accordance with your firm’s AML and CIP policies.
          Decisions are recorded immutably for audit.
        </p>
      </header>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer email</th>
              <th>Review status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={2}>
                  <div className="empty-state">Loading queue…</div>
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={2}>
                  <div className="empty-state">No items in queue.</div>
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.user.email}</td>
                  <td>
                    <span className={statusBadgeClass(r.status)}>{r.status.replace(/_/g, " ")}</span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
