import { useEffect, useState } from "react";
import { adminFetch } from "../lib/api";

type Row = { id: string; status: string; user: { email: string } };

export function KycQueue() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    adminFetch("/admin/kyc-queue")
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  return (
    <div>
      <h1>KYC queue</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {rows.map((r) => (
          <li
            key={r.id}
            style={{
              padding: 12,
              marginBottom: 8,
              background: "#152238",
              borderRadius: 8,
              border: "1px solid #2a3f5f",
            }}
          >
            {r.user.email} — {r.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
