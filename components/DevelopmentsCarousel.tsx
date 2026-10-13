"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll } from "motion/react";
import { developments, formatAcres, formatPlots } from "@/lib/data";
import { Arrow, SampleTag, SectionLabel } from "./ui";

const pad = (n: number) => String(n).padStart(2, "0");

export default function DevelopmentsCarousel() {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const { scrollXProgress } = useScroll({ container: track });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const items = Array.from(el.children) as HTMLElement[];
      const left = el.scrollLeft + el.clientWidth * 0.25;
      let i = 0;
      items.forEach((it, idx) => it.offsetLeft - el.offsetLeft <= left && (i = idx));
      setActive(i);
      setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const step = (d: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0");
    el.scrollBy({ left: d * (first.offsetWidth + gap), behavior: "smooth" });
  };

  return (
    <section id="developments" className="relative overflow-hidden bg-charcoal py-24 text-ivory md:py-32" aria-labelledby="dev-title">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="grid items-end gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <SectionLabel index="01" className="mb-8 text-stone">Featured Developments</SectionLabel>
            <h2 id="dev-title" className="display text-[clamp(2.75rem,6.5vw,6.5rem)] font-medium">
              Explore the Land.
            </h2>
            <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-stone">
              Every development has its own character. Find the one that fits your vision.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="font-display tabular-nums text-sm text-stone">
              <span className="text-ivory">{pad(active + 1)}</span> / {pad(developments.length)}
            </div>
            <div className="flex gap-2">
              <NavBtn dir="left" disabled={edges.start} onClick={() => step(-1)} />
              <NavBtn dir="right" disabled={edges.end} onClick={() => step(1)} />
            </div>
          </div>
        </div>
      </div>

      <ul
        ref={track}
        aria-label="Developments"
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 md:mt-20 md:gap-8 md:px-10 xl:px-[max(2.5rem,calc((100vw-1600px)/2+2.5rem))] scroll-px-5 md:scroll-px-10 xl:scroll-px-[max(2.5rem,calc((100vw-1600px)/2+2.5rem))]"
      >
        {developments.map((d, i) => (
          <li key={d.id} className="w-[86vw] shrink-0 snap-start md:w-[62vw] xl:w-[44vw] 2xl:w-[700px]">
            <article className="group">
              <a href="#master-plan" className="block" aria-label={`Explore ${d.name}, ${d.city}, ${d.state}`}>
                <div className="relative aspect-[16/10] overflow-hidden bg-forest">
                  <Image
                    src={d.cardImage.src}
                    alt={d.cardImage.alt}
                    fill
                    sizes="(min-width:1280px) 44vw, (min-width:768px) 62vw, 86vw"
                    className="object-cover transition-transform duration-[1.6s] ease-cine group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(17,23,20,0.85)_0%,rgba(17,23,20,0)_55%)]" />
                  <div className="absolute left-5 top-5 flex items-center gap-3 md:left-7 md:top-7">
                    <span className="label tabular-nums text-white/80">No. {pad(i + 1)}</span>
                    {!d.verified && <SampleTag />}
                  </div>
                  <div className="absolute inset-x-5 bottom-5 md:inset-x-7 md:bottom-7">
                    <div className="label mb-3 text-lime">{d.status}</div>
                    <h3 className="display text-[clamp(1.9rem,3.4vw,3.25rem)] font-medium text-white">{d.name}</h3>
                    <p className="mt-2 text-sm text-white/75">
                      {d.city}, {d.state} · {d.county}
                    </p>
                  </div>
                </div>
              </a>
              <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-4 border-b border-white/10 py-5">
                <Stat k="Total acreage" v={formatAcres(d.acreage)} />
                <Stat k="Plots" v={formatPlots(d.plotCount)} />
                <a href="#master-plan" className="group/link inline-flex items-center gap-2 pb-0.5 text-sm text-ivory">
                  <span className="hidden sm:inline">Explore Development</span>
                  <span className="sm:hidden">Explore</span>
                  <Arrow className="h-4 w-4 transition-transform duration-500 group-hover/link:translate-x-1" />
                </a>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-stone">{d.summary}</p>
            </article>
          </li>
        ))}
        <li aria-hidden className="w-px shrink-0" />
      </ul>

      <div className="mx-auto mt-12 max-w-[1600px] px-5 md:px-10">
        <div className="h-px w-full bg-white/10">
          <motion.div className="h-full origin-left bg-lime" style={{ scaleX: scrollXProgress }} />
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="label mb-1.5 text-stone/80">{k}</div>
      <div className="text-sm text-ivory">{v}</div>
    </div>
  );
}

function NavBtn({ dir, disabled, onClick }: { dir: "left" | "right"; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Previous development" : "Next development"}
      className="grid h-14 w-14 place-items-center border border-white/20 transition-colors duration-300 hover:border-lime hover:bg-lime hover:text-charcoal disabled:pointer-events-none disabled:opacity-30"
    >
      <Arrow dir={dir} className="h-5 w-5" />
    </button>
  );
}
