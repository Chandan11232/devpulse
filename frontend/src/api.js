const BASE = "/api";
const BACKEND_URL =
  window.location.hostname === "localhost"
    ? ""
    : "https://devpulse-backend-91x8.onrender.com"; // <-- Put your actual live Render backend URL here

export async function fetchSummary() {
  const response = await fetch(`${BACKEND_URL}/api/summary`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
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
