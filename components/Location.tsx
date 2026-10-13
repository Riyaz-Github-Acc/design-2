"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { getDevelopment, images, surroundings } from "@/lib/data";
import { SampleTag, SectionLabel } from "./ui";

const dev = getDevelopment(surroundings.developmentId);

// Stylised, not-to-scale context map (viewBox 600×600). Positions are diagrammatic.
const pins: Record<string, [number, number]> = {
  "Downtown Franklin": [318, 300],
  "Interstate 65": [392, 210],
  Nashville: [430, 70],
  "BNA International Airport": [520, 110],
  "Harpeth River access": [222, 262],
};
const SITE: [number, number] = [210, 390];

export default function Location() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <section id="location" className="bg-charcoal pb-24 text-ivory md:pb-32" aria-labelledby="loc-title">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-12">
        <motion.div
          className="relative aspect-[4/5] overflow-hidden lg:col-span-7 lg:aspect-auto lg:min-h-[720px]"
          initial={{ clipPath: "inset(12% 12% 12% 12%)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image src={images.location.src} alt={images.location.alt} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(17,23,20,0.85),rgba(17,23,20,0)_55%)]" />
          <div className="absolute inset-x-6 bottom-6 md:inset-x-10 md:bottom-10">
            <SectionLabel index="05" className="mb-6 text-white/75">Location & Surroundings</SectionLabel>
            <h2 id="loc-title" className="display max-w-xl text-[clamp(2.4rem,5vw,5rem)] font-medium text-white">
              Rooted in Place.
            </h2>
            <p className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-white/80">{surroundings.intro}</p>
          </div>
        </motion.div>

        <div className="flex flex-col lg:col-span-5">
          <div className="relative aspect-square border border-white/12 bg-[#151d18]">
            <svg viewBox="0 0 600 600" className="h-full w-full" role="img" aria-label={`Diagrammatic location map of ${dev.name} and nearby places`}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0H0V40" fill="none" stroke="rgba(244,242,235,0.05)" />
                </pattern>
              </defs>
              <rect width="600" height="600" fill="url(#grid)" />
              {/* contours */}
              {[60, 100, 140, 185].map((r, i) => (
                <ellipse key={r} cx={160} cy={470} rx={r * 1.3} ry={r} fill="none" stroke="rgba(217,232,166,0.08)" transform={`rotate(${-12 + i * 3} 160 470)`} />
              ))}
              {/* river */}
              <path d="M -10 330 C 90 300, 160 210, 250 250 S 330 390, 420 380 S 560 300, 620 330" fill="none" stroke="rgba(140,170,165,0.45)" strokeWidth="5" strokeLinecap="round" />
              {/* roads */}
              <path d="M 330 620 L 380 330 L 400 200 L 440 -10" fill="none" stroke="rgba(244,242,235,0.55)" strokeWidth="3" />
              <path d="M 330 620 L 380 330 L 400 200 L 440 -10" fill="none" stroke="#151d18" strokeWidth="1" strokeDasharray="10 8" />
              <path d="M -10 420 L 210 390 L 318 300 L 600 270" fill="none" stroke="rgba(244,242,235,0.35)" strokeWidth="1.6" />
              <path d="M 318 300 L 300 620" fill="none" stroke="rgba(244,242,235,0.22)" strokeWidth="1.2" />
              <path d="M 400 200 L 600 140" fill="none" stroke="rgba(244,242,235,0.22)" strokeWidth="1.2" />
              <text x="402" y="300" fontSize="10" letterSpacing="2" fill="rgba(244,242,235,0.6)">I-65</text>
              <text x="40" y="402" fontSize="10" letterSpacing="2" fill="rgba(244,242,235,0.45)" transform="rotate(-7 40 402)">COUNTY RD</text>

              {/* site */}
              <motion.g initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.3 }} style={{ transformOrigin: `${SITE[0]}px ${SITE[1]}px` }}>
                <circle cx={SITE[0]} cy={SITE[1]} r="34" fill="rgba(217,232,166,0.08)" stroke="rgba(217,232,166,0.35)" strokeDasharray="3 4" />
                <rect x={SITE[0] - 11} y={SITE[1] - 11} width="22" height="22" fill="#D9E8A6" />
                <text x={SITE[0]} y={SITE[1] + 56} textAnchor="middle" fontSize="12" letterSpacing="2.5" fill="#D9E8A6">{dev.name.toUpperCase()}</text>
              </motion.g>

              {surroundings.places.map((p) => {
                const [x, y] = pins[p.name];
                const on = active === p.name;
                return (
                  <g key={p.name}>
                    {on && <line x1={SITE[0]} y1={SITE[1]} x2={x} y2={y} stroke="#D9E8A6" strokeDasharray="4 4" />}
                    <circle cx={x} cy={y} r={on ? 7 : 4.5} fill={on ? "#D9E8A6" : "#F4F2EB"} style={{ transition: "r .3s" }} />
                    <text x={x + 12} y={y + 4} fontSize="11.5" fill={on ? "#D9E8A6" : "rgba(244,242,235,0.75)"}>
                      {p.name}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute left-4 top-4 flex items-center gap-3">
              <span className="label text-white/50">Diagrammatic · not to scale</span>
            </div>
          </div>

          <ul className="mt-8 border-t border-white/10" aria-label="Nearby places">
            {surroundings.places.map((p) => (
              <li key={p.name}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(p.name)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(p.name)}
                  onBlur={() => setActive(null)}
                  className="grid w-full grid-cols-[1fr_auto] items-baseline gap-4 border-b border-white/10 py-4 text-left"
                >
                  <span>
                    <span className={`block font-display text-lg tracking-tight transition-colors ${active === p.name ? "text-lime" : ""}`}>{p.name}</span>
                    <span className="label text-white/45">{p.kind}</span>
                  </span>
                  <span className="tabular-nums text-sm text-stone">{p.distance}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-3 text-xs text-white/45">
            <SampleTag>To be verified</SampleTag>
            Drive times are indicative placeholders.
          </div>
        </div>
      </div>
    </section>
  );
}
