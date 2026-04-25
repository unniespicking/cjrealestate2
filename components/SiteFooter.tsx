import Link from "next/link";
import { Instagram, Facebook, Linkedin, Mail, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="container-site py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-display text-3xl text-paper tracking-tightest">CJ</span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-paper/60">
                Real Estate
              </span>
            </div>
            <p className="text-paper/75 max-w-sm leading-relaxed">
              Sydney Inner West property specialists since 2001. Rhodes, Newington, Meadowbank and
              beyond.
            </p>

            <div className="flex gap-4 mt-8">
              <a href="#" aria-label="Instagram" className="hover:text-copper transition">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-copper transition">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-copper transition">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="eyebrow !text-paper/50 mb-4">Property</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/buy" className="hover:text-copper">Buy</Link></li>
              <li><Link href="/sell" className="hover:text-copper">Sell</Link></li>
              <li><Link href="/lease" className="hover:text-copper">Lease</Link></li>
              <li><Link href="/sell/instant-appraisal" className="hover:text-copper">Instant Appraisal</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="eyebrow !text-paper/50 mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/manage/landlords" className="hover:text-copper">Landlords</Link></li>
              <li><Link href="/manage/tenants" className="hover:text-copper">Tenants</Link></li>
              <li><Link href="/portal/tenant" className="hover:text-copper">Tenant Portal</Link></li>
              <li><Link href="/portal/landlord" className="hover:text-copper">Landlord Portal</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="eyebrow !text-paper/50 mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-copper">About</Link></li>
              <li><Link href="/about/team" className="hover:text-copper">Team</Link></li>
              <li><Link href="/about/offices" className="hover:text-copper">Offices</Link></li>
              <li><Link href="/insights" className="hover:text-copper">Insights</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="eyebrow !text-paper/50 mb-4">Rhodes Office</h4>
            <ul className="space-y-2.5 text-sm text-paper/80">
              <li>Shop 5, 46 Walker St<br />Rhodes NSW 2138</li>
              <li className="flex items-center gap-2">
                <Phone size={14} /> 02 9739 6000
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} /> rentals@cjintl.com.au
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-paper/15 flex flex-col md:flex-row justify-between gap-4 text-xs text-paper/55">
          <p>© {new Date().getFullYear()} CJ Real Estate Pty Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-paper">Privacy</Link>
            <Link href="/disclaimer" className="hover:text-paper">Disclaimer</Link>
            <Link href="/about/careers" className="hover:text-paper">Careers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
