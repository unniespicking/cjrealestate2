import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Home, Key } from "lucide-react";

export default function Manage() {
  return (
    <>
      <section className="relative h-[50vh] min-h-[380px] bg-ink text-paper overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=2400&q=85" alt="" fill className="object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 to-ink/90" />
        <div className="relative container-site h-full flex flex-col justify-end pb-12 md:pb-20">
          <span className="eyebrow !text-paper/60">Property Management</span>
          <h1 className="display-xl max-w-3xl">Managed like it's our own.</h1>
        </div>
      </section>

      <section className="container-site py-16 md:py-24 grid md:grid-cols-2 gap-8">
        <Link href="/manage/landlords" className="group block border border-ink/10 p-8 md:p-12 hover:bg-ink hover:text-paper transition">
          <Home size={28} className="text-copper mb-6" />
          <h2 className="display-md">For Landlords</h2>
          <p className="text-ink-muted group-hover:text-paper/70 mt-4 leading-relaxed">
            Dedicated area manager, active tenant sourcing, and a real-time portal that shows every
            rent receipt and inspection report as it lands.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm">Learn more <ArrowRight size={14} /></div>
        </Link>
        <Link href="/manage/tenants" className="group block border border-ink/10 p-8 md:p-12 hover:bg-ink hover:text-paper transition">
          <Key size={28} className="text-copper mb-6" />
          <h2 className="display-md">For Tenants</h2>
          <p className="text-ink-muted group-hover:text-paper/70 mt-4 leading-relaxed">
            Online application, in-app maintenance requests with photos, and a rent ledger you can
            download in one click when your accountant asks.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm">Learn more <ArrowRight size={14} /></div>
        </Link>
      </section>
    </>
  );
}
