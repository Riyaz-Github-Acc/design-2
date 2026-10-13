"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { formatAcres, formatPlots, getDevelopment, images } from "@/lib/data";
import { planMeta } from "@/lib/siteplan";
import { SectionLabel } from "./ui";

// Overlay geometry in a 1600×900 frame that matches the cover-cropped photograph.
const boundary = "M 900 170 L 1400 140 L 1470 480 L 1280 690 L 1000 560 Z";
const overlayPlots = [
  { id: "A", d: "M 940 220 L 1150 205 L 1165 380 L 990 392 Z", label: "Plot 01", area: "0.65 ac", at: [1062, 300] },
  { id: "B", d: "M 1170 204 L 1360 190 L 1400 362 L 1185 378 Z", label: "Plot 03", area: "0.65 ac", at: [1280, 286] },
  { id: "C", d: "M 1010 412 L 1185 400 L 1230 600 L 1080 562 Z", label: "Plot 08", area: "0.26 ac", at: [1128, 490] },
];

export default function BiggerPicture() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-2%", "2%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.14, 1.06]);
  const draw = useTransform(scrollYProgress, [0.08, 0.42], [0, 1]);
  const boundaryOpacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);
  const headingY = useTransform(scrollYProgress, [0, 0.3], ["2rem", "0rem"]);
  const headingO = useTransform(scrollYProgress, [0, 0.18], [0, 1]);

  return (
    <section id="landscape" ref={ref} className="relative h-[240vh] bg-charcoal" aria-labelledby="bp-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Photo and boundary overlay share one transform, so the lines stay pinned to the land */}
        <motion.div className="absolute inset-0" style={{ y: imgY, scale: imgScale }}>
          <Image src={images.biggerPicture.src} alt={images.biggerPicture.alt} fill sizes="100vw" className="object-cover object-right" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(17,23,20,0)_35%,rgba(17,23,20,0.55)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(17,23,20,0.85),rgba(17,23,20,0))]" />
          <div className="absolute inset-y-0 left-0 w-2/3 bg-[linear-gradient(90deg,rgba(17,23,20,0.6),rgba(17,23,20,0))]" />

          <svg viewBox="0 0 1600 900" preserveAspectRatio="xMaxYMid slice" className="absolute inset-0 h-full w-full">
            <motion.path
              d={boundary}
              fill="none"
              stroke="#F4F2EB"
              strokeWidth={1.6}
              vectorEffect="non-scaling-stroke"
              style={{ pathLength: draw, opacity: boundaryOpacity }}
            />
            <motion.path d={boundary} fill="rgba(217,232,166,0.06)" style={{ opacity: draw }} />
            {overlayPlots.map((p, i) => (
              <OverlayPlot key={p.id} plot={p} progress={scrollYProgress} start={0.45 + i * 0.1} />
            ))}
            <BoundaryLabel progress={scrollYProgress} />
          </svg>
        </motion.div>

        <div className="pointer-events-none relative mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 pb-10 pt-28 md:px-10 md:pt-32">
          <motion.div style={{ y: headingY, opacity: headingO }} className="max-w-md">
            <SectionLabel index="03" className="mb-6 text-white/70">The Bigger Picture</SectionLabel>
            <h2 id="bp-title" className="display text-[clamp(2.1rem,3.6vw,3.6rem)] font-medium text-white">
              Every Plot Begins With a Bigger Picture.
            </h2>
          </motion.div>
          <Legend progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}

function OverlayPlot({ plot, progress, start }: { plot: (typeof overlayPlots)[number]; progress: MotionValue<number>; start: number }) {
  const [hover, setHover] = useState(false);
  const o = useTransform(progress, [start, start + 0.08], [0, 1]);
  const len = useTransform(progress, [start, start + 0.12], [0, 1]);
  return (
    <motion.g style={{ opacity: o }} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)} className="cursor-default">
      <motion.path
        d={plot.d}
        fill={hover ? "rgba(217,232,166,0.28)" : "rgba(217,232,166,0.1)"}
        stroke="#D9E8A6"
        strokeWidth={hover ? 2 : 1.1}
        vectorEffect="non-scaling-stroke"
        style={{ pathLength: len, transition: "fill .3s" }}
      />
      <g transform={`translate(${plot.at[0]} ${plot.at[1]})`} pointerEvents="none">
        <text textAnchor="middle" fill="#fff" fontSize="22" fontFamily="var(--font-space-grotesk)" letterSpacing="-0.5">
          {plot.label}
        </text>
        <text y="24" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="13" letterSpacing="2">
          {plot.area.toUpperCase()}
        </text>
      </g>
    </motion.g>
  );
}

function BoundaryLabel({ progress }: { progress: MotionValue<number> }) {
  const o = useTransform(progress, [0.3, 0.42], [0, 1]);
  return (
    <motion.g style={{ opacity: o }} pointerEvents="none">
      <line x1="1280" y1="690" x2="1250" y2="745" stroke="#F4F2EB" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <text x="1244" y="768" textAnchor="end" fill="#F4F2EB" fontSize="13" letterSpacing="2.5">DEVELOPMENT BOUNDARY</text>
      <text x="1244" y="788" textAnchor="end" fill="rgba(244,242,235,0.65)" fontSize="12" letterSpacing="2">ILLUSTRATIVE · NOT TO SCALE</text>
    </motion.g>
  );
}

const dev = getDevelopment(planMeta.developmentId);

function Legend({ progress }: { progress: MotionValue<number> }) {
  const o = useTransform(progress, [0.55, 0.7], [0, 1]);
  return (
    <motion.div style={{ opacity: o }} className="grid max-w-3xl grid-cols-3 border-t border-white/25 pt-5 text-white">
      {[
        [dev.name, "Development"],
        [formatAcres(dev.acreage), dev.verified ? "Total site" : "Total site (sample)"],
        [formatPlots(dev.plotCount), dev.verified ? "Planned" : "Planned (sample)"],
      ].map(([v, k]) => (
        <div key={k}>
          <div className="font-display text-lg tracking-tight md:text-2xl">{v}</div>
          <div className="label mt-1 text-white/60">{k}</div>
        </div>
      ))}
    </motion.div>
  );
}
