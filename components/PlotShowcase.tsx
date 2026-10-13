"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { getDevelopment, showcase } from "@/lib/data";
import { usePlotSelection } from "@/lib/plot-context";
import { acres, planMeta, plots, sqft, statusMeta, usd } from "@/lib/siteplan";
import PlanMini from "./PlanMini";
import { Arrow, SampleTag, SectionLabel } from "./ui";

const dev = getDevelopment(planMeta.developmentId);
const items = showcase.map((s) => ({ ...s, plot: plots.find((p) => p.id === s.plotId)! }));

export default function PlotShowcase() {
  const [lead, ...rest] = items;
  return (
    <section id="plots" className="scroll-mt-16 bg-charcoal py-24 text-ivory md:py-32" aria-labelledby="plots-title">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8 md:mb-20">
          <div>
            <SectionLabel index="04" className="mb-8 text-stone">Individual Plots</SectionLabel>
            <h2 id="plots-title" className="display text-[clamp(2.6rem,6vw,6rem)] font-medium">
              Room to Begin.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-stone">
            A selection of homesites from {dev.name}. Prices and availability shown are sample data until the plat is recorded.
          </p>
        </div>

        {/* Lead panel — wide */}
        <Panel item={lead} wide />

        {/* Two tall panels */}
        <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2 md:gap-8">
          {rest.map((it, i) => (
            <Panel key={it.plotId} item={it} offset={i === 1} />
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <a
            href="#master-plan"
            className="group inline-flex items-center gap-4 bg-lime py-4 pl-7 pr-6 text-sm font-medium text-charcoal transition-colors hover:bg-ivory"
          >
            Browse All Available Plots
            <Arrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Panel({ item, wide, offset }: { item: (typeof items)[number]; wide?: boolean; offset?: boolean }) {
  const { showOnPlan } = usePlotSelection();
  const p = item.plot;
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden bg-forest ${wide ? "aspect-[4/5] md:aspect-[21/9]" : "aspect-[4/5]"} ${offset ? "md:mt-24" : ""}`}
    >
      <Image
        src={item.image.src}
        alt={item.image.alt}
        fill
        sizes={wide ? "100vw" : "(min-width:768px) 50vw, 100vw"}
        className="object-cover transition-transform duration-[1.8s] ease-cine group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(17,23,20,0.9)_0%,rgba(17,23,20,0.25)_45%,rgba(17,23,20,0.1)_100%)]" />
      {wide && <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(17,23,20,0.6)_0%,rgba(17,23,20,0)_50%)] md:block" />}

      <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-8 lg:p-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 border border-white/30 bg-charcoal/30 px-2.5 py-1 text-xs backdrop-blur">
              <span className={`h-1.5 w-1.5 rounded-full ${p.status === "available" ? "bg-lime" : "bg-stone"}`} />
              {statusMeta[p.status].label}
            </span>
            <SampleTag />
          </div>
          {/* locator */}
          <div className="w-[88px] border border-white/20 bg-charcoal/55 p-2 backdrop-blur md:w-[120px]">
            <PlanMini highlight={p.id} className="block w-full" />
            <div className="label mt-1.5 text-center !text-[0.55rem] text-white/60">Site locator</div>
          </div>
        </div>

        <div className={wide ? "grid gap-8 md:grid-cols-[1fr_auto] md:items-end" : ""}>
          <div>
            <div className="label mb-3 text-white/70">{item.title}</div>
            <h3 className="display text-[clamp(3rem,7vw,7rem)] font-medium leading-[0.85] text-white">
              Plot {p.number}
            </h3>
            <p className="mt-3 text-sm text-white/75">
              {dev.name} · {dev.city}, {dev.state}
            </p>
          </div>
          <div className={`${wide ? "" : "mt-6"}`}>
            <dl className="grid grid-cols-2 gap-x-8 border-t border-white/25 pt-4 text-white">
              <div>
                <dt className="label mb-1 text-white/55">Lot area</dt>
                <dd className="font-display text-xl tabular-nums tracking-tight">
                  {sqft(p).toLocaleString()} sf <span className="text-sm text-white/60">/ {acres(p).toFixed(2)} ac</span>
                </dd>
              </div>
              <div>
                <dt className="label mb-1 text-white/55">Asking price</dt>
                <dd className="font-display text-xl tabular-nums tracking-tight">{usd(p.price)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => showOnPlan(p.id)}
              className="group/btn mt-5 inline-flex items-center gap-3 text-sm text-white"
            >
              <span className="grid h-9 w-9 place-items-center border border-white/35 transition-colors group-hover/btn:border-lime group-hover/btn:bg-lime group-hover/btn:text-charcoal">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden><circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" /><path d="M8 0v4M8 12v4M0 8h4M12 8h4" stroke="currentColor" /></svg>
              </span>
              View on Master Plan
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
