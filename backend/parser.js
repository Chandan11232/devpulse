export function parseCoralOutput(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.rows) return parsed.rows;
    if (parsed.data) return parsed.data;
    return [parsed];
  } catch {
    const lines = trimmed.split("\n").filter(Boolean);
    const results = [];
    for (const line of lines) {
      try {
        results.push(JSON.parse(line));
      } catch {
        continue;
      }
    }
    return results;
  }
}
