import { useEffect, useState } from "react";
import { adminFetch } from "../lib/api";

export function Dashboard() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    adminFetch("/health")
      .then((r) => r.json())
      .then((j) => setMsg(JSON.stringify(j)))
      .catch(() => setMsg("API unreachable — set VITE_API_URL and admin JWT"));
  }, []);

  return (
    <div>
      <h1>Operations</h1>
      <p style={{ color: "#8b9bb4", maxWidth: 560 }}>
        Wire your admin JWT from login (seed an admin user via <code>apps/api/prisma/seed.ts</code>).
        Endpoints: <code>/admin/transactions</code>, <code>/admin/kyc-queue</code>,{" "}
        <code>/admin/analytics/summary</code>, <code>/admin/aml</code>.
      </p>
      <pre
        style={{
          background: "#152238",
          padding: 16,
          borderRadius: 8,
          border: "1px solid #2a3f5f",
        }}
      >
        {msg}
      </pre>
    </div>
  );
}
