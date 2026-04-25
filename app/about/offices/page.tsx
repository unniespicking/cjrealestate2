import { Phone, MapPin, Mail } from "lucide-react";

const offices = [
  {
    name: "Rhodes",
    address: "Shop 5, 46 Walker Street, Rhodes NSW 2138",
    phone: "02 9739 6000",
    email: "rentals@cjintl.com.au",
    coverage: "Rhodes · Meadowbank · Liberty Grove · Ermington",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
  },
  {
    name: "Newington",
    address: "Newington NSW 2127",
    phone: "02 9737 8338",
    email: "rentals@cjintl.com.au",
    coverage: "Newington · Wentworth Point · Lidcombe · Silverwater",
    image: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=80",
  },
];

export default function Offices() {
  return (
    <div className="container-site py-12 md:py-20">
      <span className="eyebrow">Offices</span>
      <h1 className="display-lg mt-2">Two offices, one network.</h1>

      <div className="grid md:grid-cols-2 gap-10 mt-16">
        {offices.map((o) => (
          <div key={o.name} className="group">
            <div className="relative aspect-[4/3] bg-stone overflow-hidden">
              <img src={o.image} alt={o.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-700" />
            </div>
            <div className="pt-6">
              <h2 className="font-display text-4xl">{o.name}</h2>
              <div className="flex flex-col gap-2 mt-5 text-sm">
                <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-ink-muted" />{o.address}</div>
                <div className="flex items-center gap-2"><Phone size={14} className="text-ink-muted" />{o.phone}</div>
                <div className="flex items-center gap-2"><Mail size={14} className="text-ink-muted" />{o.email}</div>
              </div>
              <div className="mt-5 pt-4 border-t border-ink/10">
                <span className="eyebrow">Coverage</span>
                <p className="text-sm mt-1">{o.coverage}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
