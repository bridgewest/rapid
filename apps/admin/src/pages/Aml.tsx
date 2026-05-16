import { useEffect, useState } from "react";
import { adminFetch } from "../lib/api";

export function Aml() {
  const [rows, setRows] = useState<unknown[]>([]);

  useEffect(() => {
    adminFetch("/admin/aml")
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  return (
    <div>
      <h1>AML flags</h1>
      <pre style={{ background: "#152238", padding: 16, borderRadius: 8 }}>{JSON.stringify(rows, null, 2)}</pre>
    </div>
  );
}
