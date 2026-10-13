import { company, developments } from "@/lib/data";
import { Wordmark } from "./ui";

export default function Footer() {
  const cols = [
    { title: "Developments", links: developments.map((d) => ({ label: d.name, href: "#developments" })) },
    {
      title: "Plot Discovery",
      links: [
        { label: "Interactive master plan", href: "#master-plan" },
        { label: "Available plots", href: "#plots" },
        { label: "Location & surroundings", href: "#location" },
        { label: "Planning & documents", href: "#approach" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Our approach", href: "#approach" },
        { label: "Contact", href: "#contact" },
      ],
    },
  ];

  return (
    <footer id="about" className="border-t border-white/10 bg-charcoal text-ivory">
      <div className="mx-auto max-w-[1600px] px-5 pb-10 pt-20 md:px-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Wordmark />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-stone">
              We acquire larger tracts of land across the United States and subdivide them into individual plots, in
              line with local regulations and approved development plans.
            </p>
            <div id="contact" className="mt-8 scroll-mt-24 space-y-1 text-sm">
              <a href={`mailto:${company.email}`} className="block hover:text-lime">{company.email}</a>
              <span className="block text-stone">{company.phone}</span>
              <span className="block text-stone">{company.address}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="label mb-5 text-white/45">{c.title}</div>
                <ul className="space-y-3 text-sm">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-ivory/85 transition-colors hover:text-lime">{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t border-white/10 pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-white/45">
            <span className="text-white/65">Property disclosures.</span> Development names, locations, acreages, plot counts,
            prices and statuses on this site are sample content for design purposes and must be replaced with verified
            information. Maps and plans are illustrative and not to scale. This website is not an offer to sell, nor a
            solicitation of an offer to buy, property in any jurisdiction where prior registration or qualification is
            required. Equal Housing Opportunity.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-white/45">
            <span>© {new Date().getFullYear()} {company.name} {company.suffix} All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-ivory">Privacy Policy</a>
              <a href="#" className="hover:text-ivory">Terms of Use</a>
              <a href="#" className="hover:text-ivory">Property Disclosures</a>
              <a href="#" className="hover:text-ivory">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
