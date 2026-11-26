import { useEffect, useState } from "react";
import { adminFetch } from "../lib/api";

export function Dashboard() {
  const [health, setHealth] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/health")
      .then(async (r) => {
        const j = await r.json();
        setHealth(JSON.stringify(j, null, 2));
      })
      .catch(() => setHealth("// Connection failed — confirm VITE_API_URL and network access"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="page-header">
        <p className="page-header__eyebrow">Operations</p>
        <h1 className="page-header__title">Overview</h1>
        <p className="page-header__desc">
          Monitor Lizor platform health, money-movement activity, and compliance queues. This console is
          intended for authorized operations and compliance staff only.
        </p>
      </header>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-card__label">Platform status</div>
          <div className="metric-card__value">{loading ? "…" : health.includes("ok") ? "Operational" : "Degraded"}</div>
          <div className="metric-card__hint">Core API health check</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Corridor</div>
          <div className="metric-card__value" style={{ fontSize: "1.125rem" }}>
            USD → LRD
          </div>
          <div className="metric-card__hint">United States to Liberia</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Products live</div>
          <div className="metric-card__value" style={{ fontSize: "1.125rem" }}>
            Remit · Airtime
          </div>
          <div className="metric-card__hint">Phase 3+ in roadmap</div>
        </div>
      </div>

      <div className="hint-box" style={{ marginBottom: 24 }}>
        <strong>Secure access.</strong> Authenticate with an administrator account issued by your organization.
        Paste a valid JWT into browser{" "}
        <code style={{ fontSize: "0.8em" }}>localStorage.rapid_admin_token</code> if your session has
        expired.
      </div>

      <div className="card">
        <div className="card__header">Service manifest</div>
        <div className="card__body">
          <p style={{ margin: "0 0 12px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Primary integration endpoints for this environment.
          </p>
          <ul style={{ margin: "0 0 16px", paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            <li>
              <code>/admin/transactions</code> — Activity monitoring
            </li>
            <li>
              <code>/admin/kyc-queue</code> — Identity verification queue
            </li>
            <li>
              <code>/admin/analytics/summary</code> — Revenue &amp; volume
            </li>
            <li>
              <code>/admin/aml</code> — AML case flags
            </li>
          </ul>
          <p style={{ margin: "0 0 8px", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
            LIVE HEALTH
          </p>
          <pre className="code-block">{health || "…"}</pre>
        </div>
      </div>
    </>
  );
}
