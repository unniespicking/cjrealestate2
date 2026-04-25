// Minimal RFC 4180-ish CSV parser/writer.
// - Quotes fields that contain commas, quotes, or newlines
// - Escapes inner quotes by doubling
// - Preserves order of provided columns

export function writeCsvRows(headers: string[], rows: Record<string, string>[]): string {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => quoteField(row[h] ?? "")).join(","));
  }
  return lines.join("\n") + "\n";
}

function quoteField(v: string): string {
  if (/[",\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const records: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      records.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field !== "" || row.length) {
    row.push(field);
    records.push(row);
  }

  if (records.length === 0) return { headers: [], rows: [] };

  const headers = records[0];
  const rows = records.slice(1)
    .filter((r) => r.length > 0 && !(r.length === 1 && r[0] === ""))
    .map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = r[idx] ?? "";
      });
      return obj;
    });

  return { headers, rows };
}
