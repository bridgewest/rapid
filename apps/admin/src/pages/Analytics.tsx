import { useEffect, useState } from "react";
import { adminFetch } from "../lib/api";

type ByKind = {
  kind: string;
  _sum: { sendAmountUsdCents: number | null; feeTotalUsdCents: number | null };
};

type Summary = {
  volumeSendUsdCents?: number;
  feesCollectedUsdCents?: number;
  byKind?: ByKind[];
};

function money(cents: number | null | undefined) {
  const c = cents ?? 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100);
}

export function Analytics() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/admin/analytics/summary")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="page-header">
        <p className="page-header__eyebrow">Reporting</p>
        <h1 className="page-header__title">Revenue &amp; volume</h1>
        <p className="page-header__desc">
          Aggregated send volume and fee income. Figures reflect booked transaction activity in this
          environment and may be reconciled against treasury and processor statements.
        </p>
      </header>

      {loading && <p style={{ color: "var(--text-muted)" }}>Loading analytics…</p>}

      {!loading && !data && (
        <div className="card">
          <div className="card__body">
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Unable to load summary — confirm admin credentials and API availability.
            </p>
          </div>
        </div>
      )}

      {!loading && data && (
        <>
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-card__label">Send volume (booked)</div>
              <div className="metric-card__value">{money(data.volumeSendUsdCents)}</div>
              <div className="metric-card__hint">Customer principal moved</div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">Fees collected</div>
              <div className="metric-card__value">{money(data.feesCollectedUsdCents)}</div>
              <div className="metric-card__hint">Disclosed fee income</div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">By product</div>
            <div className="card__body card__body--flush">
              {!data.byKind?.length ? (
                <div className="empty-state">No product-level breakdown yet.</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="num">Volume</th>
                      <th className="num">Fees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byKind.map((b) => (
                      <tr key={b.kind}>
                        <td style={{ fontWeight: 500 }}>{b.kind.replace(/_/g, " ")}</td>
                        <td className="num">{money(b._sum.sendAmountUsdCents)}</td>
                        <td className="num">{money(b._sum.feeTotalUsdCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card__header">Raw export (debug)</div>
            <div className="card__body">
              <pre className="code-block">{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        </>
      )}
    </>
  );
}
