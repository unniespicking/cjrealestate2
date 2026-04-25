import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { parseCsv, writeCsvRows } from "./csv";
import { Property, properties as seedProperties } from "./data/properties";

const DB_DIR = path.join(process.cwd(), "database");
const CSV_PATH = path.join(DB_DIR, "properties.csv");
export const PHOTOS_DIR = path.join(DB_DIR, "photos");

const HEADERS = [
  "id", "action", "address", "suburb", "postcode",
  "price", "priceNumeric",
  "beds", "baths", "cars", "area", "propertyType",
  "heading", "description",
  "features", "photos",
  "agent", "lat", "lng",
  "availableFrom", "inspectionSlots",
];

function toRow(p: Property): Record<string, string> {
  return {
    id: p.id,
    action: p.action,
    address: p.address,
    suburb: p.suburb,
    postcode: p.postcode,
    price: p.price,
    priceNumeric: String(p.priceNumeric),
    beds: String(p.beds),
    baths: String(p.baths),
    cars: String(p.cars),
    area: String(p.area),
    propertyType: p.propertyType,
    heading: p.heading,
    description: p.description,
    features: JSON.stringify(p.features),
    photos: JSON.stringify(p.photos),
    agent: p.agent,
    lat: String(p.coordinates[0]),
    lng: String(p.coordinates[1]),
    availableFrom: p.availableFrom ?? "",
    inspectionSlots: JSON.stringify(p.inspectionSlots ?? []),
  };
}

function fromRow(r: Record<string, string>): Property {
  const safeJson = <T>(v: string, fallback: T): T => {
    if (!v) return fallback;
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  };
  return {
    id: r.id,
    action: r.action as Property["action"],
    address: r.address,
    suburb: r.suburb,
    postcode: r.postcode,
    price: r.price,
    priceNumeric: Number(r.priceNumeric || 0),
    beds: Number(r.beds || 0),
    baths: Number(r.baths || 0),
    cars: Number(r.cars || 0),
    area: Number(r.area || 0),
    propertyType: r.propertyType as Property["propertyType"],
    heading: r.heading,
    description: r.description,
    features: safeJson<string[]>(r.features, []),
    photos: safeJson<string[]>(r.photos, []),
    agent: r.agent,
    coordinates: [Number(r.lat || 0), Number(r.lng || 0)],
    availableFrom: r.availableFrom || undefined,
    inspectionSlots: safeJson<Property["inspectionSlots"]>(r.inspectionSlots, []),
  };
}

async function ensureSeed() {
  try {
    await fs.mkdir(PHOTOS_DIR, { recursive: true });
    await fs.access(CSV_PATH);
  } catch {
    try {
      const csv = writeCsvRows(HEADERS, seedProperties.map(toRow));
      await fs.writeFile(CSV_PATH, csv, "utf-8");
    } catch {
      // Read-only filesystem (e.g. Vercel serverless): caller falls back to seed.
    }
  }
}

export async function getProperties(): Promise<Property[]> {
  await ensureSeed();
  try {
    const text = await fs.readFile(CSV_PATH, "utf-8");
    const { rows } = parseCsv(text);
    return rows.map(fromRow);
  } catch {
    return seedProperties;
  }
}

export async function getProperty(id: string): Promise<Property | undefined> {
  const all = await getProperties();
  return all.find((p) => p.id === id);
}

export async function saveProperty(p: Property): Promise<void> {
  const all = await getProperties();
  const idx = all.findIndex((x) => x.id === p.id);
  if (idx === -1) all.push(p);
  else all[idx] = p;
  await fs.writeFile(CSV_PATH, writeCsvRows(HEADERS, all.map(toRow)), "utf-8");
}

export async function deleteProperty(id: string): Promise<void> {
  const all = await getProperties();
  const next = all.filter((p) => p.id !== id);
  await fs.writeFile(CSV_PATH, writeCsvRows(HEADERS, next.map(toRow)), "utf-8");
  // Best-effort photo cleanup
  try {
    await fs.rm(path.join(PHOTOS_DIR, id), { recursive: true, force: true });
  } catch {}
}

export async function generatePropertyId(suburb: string): Promise<string> {
  const all = await getProperties();
  const prefix = (suburb || "prop").toLowerCase().replace(/[^a-z]/g, "").slice(0, 3) || "prop";
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = `${prefix}-${String(n).padStart(3, "0")}`;
    if (!all.find((p) => p.id === candidate)) return candidate;
    n++;
    if (n > 9999) return `${prefix}-${Date.now()}`;
  }
}

export async function savePhoto(propertyId: string, filename: string, buf: Buffer): Promise<string> {
  const dir = path.join(PHOTOS_DIR, propertyId);
  await fs.mkdir(dir, { recursive: true });
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const target = path.join(dir, safe);
  await fs.writeFile(target, buf);
  return `${propertyId}/${safe}`;
}

export async function removePhoto(relPath: string): Promise<void> {
  if (relPath.startsWith("http") || relPath.startsWith("/")) return;
  try {
    await fs.unlink(path.join(PHOTOS_DIR, relPath));
  } catch {}
}
