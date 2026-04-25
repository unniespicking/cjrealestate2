import { NextResponse } from "next/server";
import {
  getProperty,
  saveProperty,
  deleteProperty,
  savePhoto,
  removePhoto,
} from "@/lib/store";
import { getCurrentStaff } from "@/lib/auth";
import { postToSlack } from "@/lib/slack-webhook";
import { Property } from "@/lib/data/properties";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getProperty(id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ property: p });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getCurrentStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await getProperty(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();
  const dataField = form.get("data");
  if (typeof dataField !== "string") {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }
  const input = JSON.parse(dataField);

  const keep: string[] = Array.isArray(input.keepPhotos) ? input.keepPhotos : [];
  // Photos that existed but are not in keep — delete from disk.
  for (const photo of existing.photos) {
    if (!keep.includes(photo)) await removePhoto(photo);
  }
  // Add any new uploads.
  for (const file of form.getAll("photos")) {
    if (file instanceof File && file.size > 0) {
      const buf = Buffer.from(await file.arrayBuffer());
      const stored = await savePhoto(id, file.name, buf);
      keep.push(stored);
    }
  }

  const updated: Property = {
    ...existing,
    action: input.action ?? existing.action,
    address: input.address ?? existing.address,
    suburb: input.suburb ?? existing.suburb,
    postcode: input.postcode ?? existing.postcode,
    price: input.price ?? existing.price,
    priceNumeric: Number(input.priceNumeric ?? existing.priceNumeric),
    beds: Number(input.beds ?? existing.beds),
    baths: Number(input.baths ?? existing.baths),
    cars: Number(input.cars ?? existing.cars),
    area: Number(input.area ?? existing.area),
    propertyType: input.propertyType ?? existing.propertyType,
    heading: input.heading ?? existing.heading,
    description: input.description ?? existing.description,
    features: Array.isArray(input.features) ? input.features.filter(Boolean) : existing.features,
    photos: keep,
    agent: input.agent ?? existing.agent,
    coordinates: [
      Number(input.lat ?? existing.coordinates[0]),
      Number(input.lng ?? existing.coordinates[1]),
    ],
    availableFrom: input.availableFrom ?? existing.availableFrom,
    inspectionSlots: Array.isArray(input.inspectionSlots)
      ? input.inspectionSlots
      : existing.inspectionSlots,
  };

  await saveProperty(updated);

  const slackPayload = {
    channel: ["Rhodes", "Meadowbank", "Liberty Grove", "Ermington"].includes(updated.suburb)
      ? "#leads-rhodes"
      : "#leads-newington",
    title: `Listing updated — ${updated.suburb}`,
    subtitle: updated.address,
    fields: [
      { label: "Status", value: updated.action },
      { label: "Price", value: updated.price },
      { label: "Photos", value: `${updated.photos.length}` },
      { label: "Edited by", value: staff.name },
    ],
    emoji: "✏️",
  };
  await postToSlack(slackPayload);

  return NextResponse.json({ ok: true, property: updated, slackPayload, by: staff.name });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getCurrentStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await getProperty(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteProperty(id);

  const slackPayload = {
    channel: ["Rhodes", "Meadowbank", "Liberty Grove", "Ermington"].includes(existing.suburb)
      ? "#leads-rhodes"
      : "#leads-newington",
    title: `Listing removed — ${existing.suburb}`,
    subtitle: existing.address,
    fields: [
      { label: "ID", value: existing.id },
      { label: "Removed by", value: staff.name },
    ],
    emoji: "🗑️",
  };
  await postToSlack(slackPayload);

  return NextResponse.json({ ok: true, slackPayload, by: staff.name });
}
