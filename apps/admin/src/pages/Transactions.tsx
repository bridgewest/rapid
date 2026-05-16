import { useEffect, useState } from "react";
import { adminFetch } from "../lib/api";

type Row = { id: string; status: string; kind: string; sendAmountUsdCents: number; user?: { email: string } };

export function Transactions() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    adminFetch("/admin/transactions")
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  return (
    <div>
      <h1>Transactions</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "#8b9bb4" }}>
            <th style={{ padding: 8 }}>Kind</th>
            <th>Status</th>
            <th>USD</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid #2a3f5f" }}>
              <td style={{ padding: 8 }}>{r.kind}</td>
              <td>{r.status}</td>
              <td>{(r.sendAmountUsdCents / 100).toFixed(2)}</td>
              <td>{r.user?.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
