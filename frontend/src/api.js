const BASE = "/api";

export async function fetchSummary() {
  const res = await fetch(`${BASE}/summary`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchSources() {
  const res = await fetch(`${BASE}/sources`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function runCustomQuery(sql) {
  const res = await fetch(`${BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Query failed");
  }
  return res.json();
}
