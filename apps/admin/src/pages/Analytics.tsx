import { useEffect, useState } from "react";
import { adminFetch } from "../lib/api";

export function Analytics() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    adminFetch("/admin/analytics/summary")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div>
      <h1>Revenue & volume</h1>
      <pre style={{ background: "#152238", padding: 16, borderRadius: 8 }}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
