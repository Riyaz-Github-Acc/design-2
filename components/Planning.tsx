"use client";

import { motion } from "motion/react";
import { SectionLabel } from "./ui";

const S = { stroke: "currentColor", fill: "none", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };

const topics = [
  {
    title: "Parcel boundaries & dimensions",
    body: "Every plot is presented with its surveyed lines, bearings and area — measured, not estimated.",
    icon: (
      <>
        <path d="M14 18 L66 12 L74 58 L20 66 Z" {...S} />
        <path d="M14 76 L74 76 M14 72v8 M74 72v8" {...S} strokeDasharray="0" />
        <text x="44" y="88" fontSize="7" textAnchor="middle" fill="currentColor">200.00&apos;</text>
        <circle cx="14" cy="18" r="2" fill="currentColor" /><circle cx="66" cy="12" r="2" fill="currentColor" />
        <circle cx="74" cy="58" r="2" fill="currentColor" /><circle cx="20" cy="66" r="2" fill="currentColor" />
      </>
    ),
  },
  {
    title: "Site access & road layouts",
    body: "How each plot is reached: road frontage, right-of-way widths and whether roads are public or private.",
    icon: (
      <>
        <path d="M34 90 V40 A14 14 0 1 1 54 40 V90" {...S} />
        <path d="M44 90 V30" {...S} strokeDasharray="3 3" />
        <circle cx="44" cy="28" r="5" {...S} />
        <path d="M8 60 H34 M54 60 H82" {...S} opacity=".5" />
      </>
    ),
  },
  {
    title: "Zoning & permitted uses",
    body: "The applicable zoning district, its setbacks and permitted uses, summarized with links to the source code.",
    icon: (
      <>
        <rect x="12" y="14" width="66" height="66" {...S} />
        <rect x="24" y="30" width="42" height="38" {...S} strokeDasharray="3 3" />
        <path d="M12 22 H24 M66 74 H78" {...S} />
        <text x="45" y="53" fontSize="9" textAnchor="middle" fill="currentColor">R-1</text>
      </>
    ),
  },
  {
    title: "Easements & restrictions",
    body: "Utility, drainage and access easements, covenants and any restrictions that affect how land can be used.",
    icon: (
      <>
        <rect x="12" y="14" width="66" height="66" {...S} />
        <path d="M12 64 H78 M12 72 H78" {...S} strokeDasharray="2 3" />
        {[16, 26, 36, 46, 56, 66].map((x) => <path key={x} d={`M${x} 72 l8 -8`} {...S} opacity=".55" />)}
        <path d="M60 14 V64" {...S} strokeDasharray="2 3" />
      </>
    ),
  },
  {
    title: "Surveys & documentation",
    body: "Boundary and topographic surveys, plats and reports — each labelled by date, author and document status.",
    icon: (
      <>
        <path d="M20 10 H58 L70 22 V82 H20 Z M58 10 V22 H70" {...S} />
        <path d="M28 36 H62 M28 46 H62 M28 56 H50" {...S} opacity=".6" />
        <path d="M40 66 l6 6 l12 -14" {...S} />
      </>
    ),
  },
  {
    title: "Approval & development status",
    body: "Where each development sits in the process — from concept to recorded plat — stated plainly.",
    icon: (
      <>
        <path d="M10 46 H80" {...S} />
        {[10, 33, 57, 80].map((x, i) => (
          <circle key={x} cx={x} cy={46} r={5} {...S} fill={i < 2 ? "currentColor" : "none"} />
        ))}
        <text x="10" y="66" fontSize="6.5" textAnchor="middle" fill="currentColor">CONCEPT</text>
        <text x="80" y="66" fontSize="6.5" textAnchor="middle" fill="currentColor">RECORDED</text>
      </>
    ),
  },
];

const stages = [
  { k: "Proposed", d: "A concept or preliminary plan. Subject to change; not approved.", style: "border-dashed border-charcoal/50" },
  { k: "Under review", d: "Submitted to the local planning authority and awaiting decision.", style: "border-charcoal/50" },
  { k: "Approved", d: "Approved by the governing body, with any conditions of approval noted.", style: "border-charcoal bg-charcoal/5" },
  { k: "Recorded", d: "Final plat recorded with the county. Lots may be legally conveyed.", style: "border-charcoal bg-charcoal text-ivory" },
];

export default function Planning() {
  return (
    <section id="approach" className="scroll-mt-16 bg-ivory py-24 text-charcoal md:py-32" aria-labelledby="approach-title">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionLabel index="06" className="mb-8 text-charcoal/60">Planning & Transparency</SectionLabel>
            <h2 id="approach-title" className="display text-[clamp(2.6rem,5.6vw,5.5rem)] font-medium">
              Clarity From the Ground Up.
            </h2>
            <p className="mt-7 max-w-md text-[1.02rem] leading-relaxed text-charcoal/70">
              Buying land should start with understanding it. For every development we explain what is known, what is
              proposed and what is still to be confirmed — with the documents to back it up.
            </p>
          </div>
          {/* Technical cross-section drawing */}
          <div className="lg:col-span-7 lg:pt-6">
            <SectionDrawing />
          </div>
        </div>

        <div className="mt-20 grid border-l border-t border-charcoal/15 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group border-b border-r border-charcoal/15 p-7 md:p-10"
            >
              <div className="flex items-start justify-between">
                <svg viewBox="0 0 90 96" className="h-20 w-20 text-forest transition-transform duration-700 ease-cine group-hover:-translate-y-1">
                  {t.icon}
                </svg>
                <span className="label tabular-nums text-charcoal/40">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-8 font-display text-xl tracking-tight">{t.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/65">{t.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20">
          <div className="label mb-6 text-charcoal/60">How we label every document</div>
          <ol className="grid gap-3 md:grid-cols-4">
            {stages.map((s, i) => (
              <li key={s.k} className={`border p-5 ${s.style}`}>
                <div className="label mb-3 tabular-nums opacity-60">Stage {i + 1}</div>
                <div className="font-display text-lg tracking-tight">{s.k}</div>
                <p className="mt-2 text-sm leading-relaxed opacity-75">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-charcoal/55">
            Plans, renderings and lot layouts shown on this website are illustrative unless identified as approved or
            recorded. Nothing here represents that a property is buildable, approved for a particular use or served by
            utilities. Buyers should review the recorded plat, title commitment and applicable regulations, and conduct
            their own due diligence.
          </p>
        </div>
      </div>
    </section>
  );
}

function SectionDrawing() {
  return (
    <motion.svg
      viewBox="0 0 800 300"
      className="w-full text-charcoal"
      aria-label="Illustrative site cross-section showing terrain, setbacks and road"
      role="img"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      <motion.path
        d="M 0 210 C 90 200, 140 170, 230 175 S 380 205, 460 190 S 640 140, 800 150"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 2, ease: [0.22, 1, 0.36, 1] } } }}
      />
      {/* ground hatching */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.line
          key={i}
          x1={i * 20 + 4}
          y1={240}
          x2={i * 20 + 16}
          y2={228}
          stroke="currentColor"
          strokeOpacity=".2"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.8 + i * 0.01 } } }}
        />
      ))}
      <line x1="0" y1="240" x2="800" y2="240" stroke="currentColor" strokeOpacity=".3" />
      <motion.g variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 1.2, duration: 0.8 } } }}>
        {/* property lines */}
        {[120, 420, 700].map((x) => (
          <g key={x}>
            <line x1={x} y1="40" x2={x} y2="250" stroke="currentColor" strokeDasharray="14 4 2 4" strokeOpacity=".7" />
            <text x={x} y="30" fontSize="10" textAnchor="middle" fill="currentColor" letterSpacing="1.5">P/L</text>
          </g>
        ))}
        {/* road */}
        <rect x="430" y="184" width="70" height="6" fill="currentColor" opacity=".8" />
        <text x="465" y="176" fontSize="9" textAnchor="middle" fill="currentColor" letterSpacing="1.5">ROAD</text>
        {/* setbacks */}
        <line x1="160" y1="80" x2="160" y2="250" stroke="#24372B" strokeDasharray="3 3" />
        <line x1="380" y1="80" x2="380" y2="250" stroke="#24372B" strokeDasharray="3 3" />
        <path d="M 120 95 H 160 M 120 90 v10 M 160 90 v10" stroke="currentColor" />
        <text x="140" y="85" fontSize="9" textAnchor="middle" fill="currentColor">20&apos;</text>
        <path d="M 380 95 H 420 M 380 90 v10 M 420 90 v10" stroke="currentColor" />
        <text x="400" y="85" fontSize="9" textAnchor="middle" fill="currentColor">30&apos;</text>
        <rect x="160" y="110" width="220" height="40" fill="#D9E8A6" opacity=".55" />
        <text x="270" y="134" fontSize="10" textAnchor="middle" fill="currentColor" letterSpacing="1.8">PERMITTED ENVELOPE (EXAMPLE)</text>
        {/* easement */}
        <rect x="700" y="60" width="30" height="190" fill="url(#ease-hatch)" />
        <text x="742" y="76" fontSize="9" fill="currentColor" letterSpacing="1.2">EASEMENT</text>
        {/* trees */}
        {[[40, 186], [70, 180], [600, 150], [640, 146], [770, 140]].map(([x, y]) => (
          <g key={x}>
            <line x1={x} y1={y} x2={x} y2={y + 18} stroke="currentColor" strokeOpacity=".6" />
            <circle cx={x} cy={y - 8} r="12" fill="none" stroke="currentColor" strokeOpacity=".6" />
          </g>
        ))}
        <text x="0" y="290" fontSize="9" fill="currentColor" opacity=".55" letterSpacing="1.8">SITE SECTION A–A · ILLUSTRATIVE · NOT TO SCALE</text>
      </motion.g>
      <defs>
        <pattern id="ease-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#24372B" strokeOpacity=".45" />
        </pattern>
      </defs>
    </motion.svg>
  );
}
