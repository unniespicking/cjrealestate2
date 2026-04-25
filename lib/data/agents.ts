export type Agent = {
  slug: string;
  name: string;
  role: string;
  office: "Rhodes" | "Newington";
  mobile: string;
  office_phone: string;
  email: string;
  languages: ("EN" | "KO" | "ZH")[];
  suburbs: string[];
  photo: string;
  bio: string;
};

// Real team data from cjrealestate.com.au/our-team
export const agents: Agent[] = [
  {
    slug: "alex-lee",
    name: "Alex Lee",
    role: "Area Manager — Rhodes+",
    office: "Rhodes",
    mobile: "0412 238 082",
    office_phone: "02 9739 6000",
    email: "alex@cjintl.com.au",
    languages: ["EN", "KO"],
    suburbs: ["Rhodes", "Meadowbank", "Liberty Grove"],
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&q=80",
    bio: "Fifteen-plus years specialising in Rhodes waterfront apartments. Led some of the suburb's highest residential sales.",
  },
  {
    slug: "kay-lee",
    name: "Kay Lee",
    role: "Sales Manager — In Charge of Marketing",
    office: "Rhodes",
    mobile: "0433 111 184",
    office_phone: "02 9739 6000",
    email: "kay@cjintl.com.au",
    languages: ["EN", "KO"],
    suburbs: ["Rhodes", "Wentworth Point", "Olympic Park"],
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&q=80",
    bio: "Orchestrates CJ's marketing playbook across digital, print and multilingual channels. Licensed Real Estate Agent.",
  },
  {
    slug: "sun-han",
    name: "Sun Han",
    role: "Property & Sales Manager",
    office: "Rhodes",
    mobile: "0431 531 342",
    office_phone: "02 9739 6000",
    email: "sun@cjintl.com.au",
    languages: ["EN", "KO"],
    suburbs: ["Rhodes", "Meadowbank", "Liberty Grove"],
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=640&q=80",
    bio: "Bridges sales and property management — the rare agent clients keep through every stage of ownership.",
  },
  {
    slug: "canti-chow",
    name: "Canti Chow",
    role: "Area Manager — Newington+",
    office: "Newington",
    mobile: "0404 486 863",
    office_phone: "02 9737 8338",
    email: "canti@cjintl.com.au",
    languages: ["EN", "ZH"],
    suburbs: ["Newington", "Silverwater", "Lidcombe", "Wentworth Point"],
    photo: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=640&q=80",
    bio: "Deep relationships across the Mandarin and Cantonese-speaking community. Licensed Real Estate Agent.",
  },
  {
    slug: "charlie-yeom",
    name: "Charlie Yeom",
    role: "Sales Consultant",
    office: "Newington",
    mobile: "0415 988 828",
    office_phone: "02 9737 8337",
    email: "charlie@cjintl.com.au",
    languages: ["EN", "KO"],
    suburbs: ["Newington", "Lidcombe", "Silverwater"],
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=640&q=80",
    bio: "Patient, detail-first approach that buyers and vendors consistently single out in reviews.",
  },
  {
    slug: "evelin-chen",
    name: "Evelin Chen",
    role: "Property Officer",
    office: "Rhodes",
    mobile: "0423 821 936",
    office_phone: "02 9739 6000",
    email: "rentals3@cjintl.com.au",
    languages: ["EN", "ZH"],
    suburbs: ["Rhodes", "Wentworth Point"],
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=640&q=80",
    bio: "Front line of CJ's rental operation. Known for turning inquiries into tenancies fast, without cutting corners.",
  },
  {
    slug: "sullivan-ji",
    name: "Sullivan Ji",
    role: "Property Officer",
    office: "Rhodes",
    mobile: "0402 279 558",
    office_phone: "02 9739 6000",
    email: "rentals1@cjintl.com.au",
    languages: ["EN", "ZH", "KO"],
    suburbs: ["Rhodes", "Meadowbank"],
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=640&q=80",
    bio: "Handles landlord portfolios end-to-end. Tri-lingual, which the Inner West's mixed tenant base appreciates.",
  },
  {
    slug: "john-in",
    name: "John In",
    role: "Sales Representative",
    office: "Rhodes",
    mobile: "0452 515 840",
    office_phone: "02 9739 6000",
    email: "john.in@cjintl.com.au",
    languages: ["EN", "KO"],
    suburbs: ["Rhodes", "Ermington", "Meadowbank"],
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=640&q=80",
    bio: "Newer to the CJ team, bringing a research-heavy approach to buyer representation.",
  },
  {
    slug: "ik-kim",
    name: "IK Kim",
    role: "Digital & Operations",
    office: "Rhodes",
    mobile: "—",
    office_phone: "02 9739 6000",
    email: "kikwebapp@gmail.com",
    languages: ["EN", "KO"],
    suburbs: ["Rhodes", "Newington", "Meadowbank"],
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=640&q=80",
    bio: "Leads the digital platform and internal tooling roll-out for CJ Real Estate.",
  },
];

export function getAgent(slug: string) {
  return agents.find((a) => a.slug === slug);
}

export function agentsForSuburb(suburb: string, language?: "EN" | "KO" | "ZH") {
  let result = agents.filter((a) => a.suburbs.includes(suburb));
  if (language) result = result.filter((a) => a.languages.includes(language));
  return result.length ? result : agents.slice(0, 3);
}
