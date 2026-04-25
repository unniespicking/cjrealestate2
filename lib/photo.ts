// Resolve a photo reference (either external URL or local relative path).
export function photoUrl(p: string): string {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("/")) return p;
  return `/api/photo/${p}`;
}
