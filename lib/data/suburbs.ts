export type Suburb = {
  slug: string;
  name: string;
  postcode: string;
  office: "Rhodes" | "Newington";
  median_unit: number;
  median_house: number | null;
  rental_yield: number;
  blurb: string;
  highlights: string[];
  image: string;
};

// CJ's core service suburbs
export const suburbs: Suburb[] = [
  {
    slug: "rhodes",
    name: "Rhodes",
    postcode: "2138",
    office: "Rhodes",
    median_unit: 1125000,
    median_house: null,
    rental_yield: 4.1,
    blurb:
      "Waterfront high-rise living ten minutes from the CBD. Rhodes is CJ's home market — we've sold more Rhodes apartments than any independent agency in the postcode.",
    highlights: ["Rhodes Central shopping", "Parramatta River foreshore", "Train + ferry access"],
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80",
  },
  {
    slug: "newington",
    name: "Newington",
    postcode: "2127",
    office: "Newington",
    median_unit: 985000,
    median_house: 2150000,
    rental_yield: 3.8,
    blurb:
      "Planned community built around the 2000 Olympic village. Wide streets, family-oriented, strong school catchments.",
    highlights: ["Newington Marketplace", "Millennium Parklands", "Close to Sydney Olympic Park"],
    image:
      "https://images.unsplash.com/photo-1448630360428-65456885c650?w=1600&q=80",
  },
  {
    slug: "meadowbank",
    name: "Meadowbank",
    postcode: "2114",
    office: "Rhodes",
    median_unit: 865000,
    median_house: 1780000,
    rental_yield: 4.3,
    blurb:
      "River outlook at Rhodes pricing minus 15–20%. Meadowbank has quietly become one of the Inner West's best value plays.",
    highlights: ["Meadowbank ferry", "TAFE NSW campus", "New retail precinct"],
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80",
  },
  {
    slug: "liberty-grove",
    name: "Liberty Grove",
    postcode: "2138",
    office: "Rhodes",
    median_unit: 895000,
    median_house: 1450000,
    rental_yield: 4.0,
    blurb:
      "Gated community with village shops and pools inside. Favoured by downsizers and young families looking for amenity-rich living.",
    highlights: ["Gated estate amenity", "Walking distance to Rhodes Station", "Community pools + gym"],
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
  },
  {
    slug: "wentworth-point",
    name: "Wentworth Point",
    postcode: "2127",
    office: "Newington",
    median_unit: 895000,
    median_house: null,
    rental_yield: 4.2,
    blurb:
      "Peninsula living with three-sides water. Newer stock, younger demographic, best-in-class amenity per dollar.",
    highlights: ["Marina Square", "Bennelong Bridge to Rhodes", "Ferry to CBD"],
    image:
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=1600&q=80",
  },
  {
    slug: "lidcombe",
    name: "Lidcombe",
    postcode: "2141",
    office: "Newington",
    median_unit: 695000,
    median_house: 1395000,
    rental_yield: 4.5,
    blurb:
      "Infrastructure-backed growth suburb — two trains a minute, major retail upgrade, large Korean and Chinese business base.",
    highlights: ["Lidcombe Station hub", "Costco & Bunnings precinct", "Diverse dining scene"],
    image:
      "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1600&q=80",
  },
  {
    slug: "silverwater",
    name: "Silverwater",
    postcode: "2128",
    office: "Newington",
    median_unit: 745000,
    median_house: null,
    rental_yield: 4.6,
    blurb:
      "Riverside pocket of newer medium-density. Strong rental yields for Inner West investors.",
    highlights: ["Riverside walkway", "Close to Olympic Park employment", "Silverwater Road access"],
    image:
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1600&q=80",
  },
  {
    slug: "ermington",
    name: "Ermington",
    postcode: "2115",
    office: "Rhodes",
    median_unit: 765000,
    median_house: 1620000,
    rental_yield: 4.0,
    blurb:
      "Ryde LGA's hidden value suburb. Established housing stock plus new medium-density along the river corridor.",
    highlights: ["Parramatta River frontage", "West Ryde & Rhodes access", "Family-sized housing"],
    image:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1600&q=80",
  },
];

export const getSuburb = (slug: string) => suburbs.find((s) => s.slug === slug);
