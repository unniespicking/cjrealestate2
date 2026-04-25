import { NextResponse } from "next/server";
import {
  generatePropertyId,
  getProperties,
  saveProperty,
  savePhoto,
} from "@/lib/store";
import { getCurrentStaff } from "@/lib/auth";
import { postToSlack } from "@/lib/slack-webhook";
import { Property } from "@/lib/data/properties";

export async function GET() {
  const all = await getProperties();
  return NextResponse.json({ properties: all });
}

export async function POST(req: Request) {
  const staff = await getCurrentStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const dataField = form.get("data");
  if (typeof dataField !== "string") {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }
  const input = JSON.parse(dataField);

  const id: string = input.id?.trim() || (await generatePropertyId(input.suburb));
  const photos: string[] = Array.isArray(input.keepPhotos) ? input.keepPhotos : [];

  for (const file of form.getAll("photos")) {
    if (file instanceof File && file.size > 0) {
      const buf = Buffer.from(await file.arrayBuffer());
      const stored = await savePhoto(id, file.name, buf);
      photos.push(stored);
    }
  }

  const property: Property = {
    id,
    action: input.action,
    address: input.address,
    suburb: input.suburb,
    postcode: input.postcode,
    price: input.price,
    priceNumeric: Number(input.priceNumeric || 0),
    beds: Number(input.beds || 0),
    baths: Number(input.baths || 0),
    cars: Number(input.cars || 0),
    area: Number(input.area || 0),
    propertyType: input.propertyType,
    heading: input.heading,
    description: input.description,
    features: Array.isArray(input.features) ? input.features.filter(Boolean) : [],
    photos,
    agent: input.agent || staff.slug,
    coordinates: [Number(input.lat || 0), Number(input.lng || 0)],
    availableFrom: input.availableFrom || undefined,
    inspectionSlots: Array.isArray(input.inspectionSlots) ? input.inspectionSlots : [],
  };

  await saveProperty(property);

  const slackPayload = {
    channel: ["Rhodes", "Meadowbank", "Liberty Grove", "Ermington"].includes(property.suburb)
      ? "#leads-rhodes"
      : "#leads-newington",
    title: `New listing — ${property.suburb}`,
    subtitle: `${property.action.toUpperCase()} · ${property.address}`,
    fields: [
      { label: "Price", value: property.price },
      { label: "Layout", value: `${property.beds}bd · ${property.baths}ba · ${property.cars}car · ${property.area}m²` },
      { label: "Type", value: property.propertyType },
      { label: "Listed by", value: staff.name },
      { label: "Photos", value: `${property.photos.length} attached` },
    ],
    emoji: "🏠",
  };

  await postToSlack(slackPayload);

  return NextResponse.json({ ok: true, property, slackPayload, by: staff.name });
}
