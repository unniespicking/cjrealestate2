export type Newsletter = {
  slug: string;
  title: string;
  period: string;
  date: string;
  excerpt: string;
  cover: string;
  topics: string[];
};

// Most recent 12 issues of the monthly CJ newsletter.
export const newsletters: Newsletter[] = [
  {
    slug: "april-2026",
    period: "April 2026",
    date: "2026-04-01",
    title: "Autumn clearance — and what RBA's hold means for Inner West vendors",
    excerpt:
      "April brings the end of the autumn selling window. Inner West median held at +2.1% MoM despite the RBA on-pause. Our read on what November's campaign calendar looks like.",
    cover: "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=1200&q=80",
    topics: ["Market Update", "Rhodes", "Newington"],
  },
  {
    slug: "march-2026",
    period: "March 2026",
    date: "2026-03-01",
    title: "Rate cut read-through and the Rhodes price recovery",
    excerpt:
      "First rate move in 14 months. Clearance rates climbed above 72% in Inner West, with Rhodes leading three-month gains.",
    cover: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
    topics: ["Market Update", "Rhodes"],
  },
  {
    slug: "february-2026",
    period: "February 2026",
    date: "2026-02-01",
    title: "Off-market volume was up 18% in January. Here's why.",
    excerpt:
      "Vendors testing price ceilings without public campaigns — our analysis of what drove a record January for CJ.",
    cover: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    topics: ["Off-Market", "Insights"],
  },
  {
    slug: "january-2026",
    period: "January 2026",
    date: "2026-01-01",
    title: "Summer 2026 outlook — demand signals across our postcodes",
    excerpt:
      "A postcode-by-postcode look at buyer enquiry density heading into the autumn selling window.",
    cover: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1200&q=80",
    topics: ["Outlook", "Newington"],
  },
  {
    slug: "december-2025",
    period: "December 2025",
    date: "2025-12-01",
    title: "Our year — 147 properties sold, 412 leases signed",
    excerpt:
      "A year-in-review with commentary from Alex, Kay and Canti.",
    cover: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    topics: ["Year Review"],
  },
  {
    slug: "november-2025",
    period: "November 2025",
    date: "2025-11-01",
    title: "Why Wentworth Point is leading Inner West yield",
    excerpt:
      "The peninsula has quietly become one of Sydney's best rental yield plays. Our data on why.",
    cover: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80",
    topics: ["Wentworth Point", "Investment"],
  },
  {
    slug: "october-2025",
    period: "October 2025",
    date: "2025-10-01",
    title: "Spring auction scorecard — CJ results",
    excerpt: "62 campaigns, 88% clearance, five record prices across our postcodes.",
    cover: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    topics: ["Auctions"],
  },
  {
    slug: "september-2025",
    period: "September 2025",
    date: "2025-09-01",
    title: "Tenant protection reforms — what landlords need to know",
    excerpt: "NSW Fair Trading changes that take effect this quarter, and how they affect your portfolio.",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
    topics: ["Property Management"],
  },
  {
    slug: "august-2025",
    period: "August 2025",
    date: "2025-08-01",
    title: "Rhodes price ceiling — or price discovery?",
    excerpt: "Three recent sales suggest the next leg of Rhodes pricing is being tested.",
    cover: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
    topics: ["Rhodes", "Market Update"],
  },
  {
    slug: "july-2025",
    period: "July 2025",
    date: "2025-07-01",
    title: "Winter rental — why CJ pre-listed 34 properties in June",
    excerpt: "A contrarian approach that paid off. Pre-market tenant sourcing strategy walkthrough.",
    cover: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
    topics: ["Rentals"],
  },
  {
    slug: "june-2025",
    period: "June 2025",
    date: "2025-06-01",
    title: "Mid-year market read",
    excerpt: "Where Inner West pricing stands vs. Sydney aggregate, and what the next six months look like.",
    cover: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80",
    topics: ["Market Update"],
  },
  {
    slug: "may-2025",
    period: "May 2025",
    date: "2025-05-01",
    title: "Lidcombe infrastructure pipeline and price trajectory",
    excerpt: "Costco's expansion, station upgrade, and what it means for the median.",
    cover: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1200&q=80",
    topics: ["Lidcombe", "Infrastructure"],
  },
];

export const getNewsletter = (slug: string) => newsletters.find((n) => n.slug === slug);
