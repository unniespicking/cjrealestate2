import { getSuburb, suburbs } from "./data/suburbs";

// Deterministic mock AVM — stands in for Domain Property Estimates API.
// Same inputs → same output; ranges reflect realistic confidence bands.
export type AvmInput = {
  suburbSlug: string;
  beds: number;
  baths: number;
  parking: number;
  propertyType: "Apartment" | "House" | "Townhouse";
  condition: "Original" | "Updated" | "Renovated" | "New";
};

export type AvmResult = {
  low: number;
  mid: number;
  high: number;
  confidence: "Low" | "Moderate" | "High";
  comparables: number;
  suburbMedian: number;
  generatedAt: string;
};

export function estimate(input: AvmInput): AvmResult {
  const suburb = getSuburb(input.suburbSlug) ?? suburbs[0];
  const base =
    input.propertyType === "House"
      ? suburb.median_house ?? suburb.median_unit * 1.7
      : suburb.median_unit;

  // Normalise bedrooms — 2bed is the median baseline
  const bedMul = { 0: 0.62, 1: 0.78, 2: 1.0, 3: 1.22, 4: 1.48, 5: 1.7 }[input.beds] ?? 1;
  const bathMul = 1 + (input.baths - 2) * 0.04;
  const carMul = 1 + input.parking * 0.03;
  const condMul = { Original: 0.92, Updated: 0.98, Renovated: 1.05, New: 1.11 }[input.condition];

  const mid = Math.round(base * bedMul * bathMul * carMul * condMul);
  const bandPct =
    input.propertyType === "House" ? 0.08 : 0.06;
  const low = Math.round(mid * (1 - bandPct));
  const high = Math.round(mid * (1 + bandPct));

  const confidence: AvmResult["confidence"] =
    input.propertyType === "House" ? "Moderate" : "High";

  return {
    low,
    mid,
    high,
    confidence,
    comparables: 18 + input.beds * 3,
    suburbMedian: base,
    generatedAt: new Date().toISOString(),
  };
}
