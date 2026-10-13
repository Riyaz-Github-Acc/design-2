"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";
import { formatAcres, formatPlots, getDevelopment, heroSlides } from "@/lib/data";
import { Arrow, SampleTag } from "./ui";

const DURATION = 7000; // ms per slide
const EASE = [0.22, 1, 0.36, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");

export default function HeroCarousel() {
  const reduce = useReducedMotion();
  const [{ index, dir }, setState] = useState({ index: 0, dir: 1 });
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const progress = useMotionValue(0);
  const touchX = useRef<number | null>(null);

  const count = heroSlides.length;
  const slide = heroSlides[index];
  const dev = getDevelopment(slide.developmentId);
  const next = heroSlides[(index + 1) % count];
  const nextDev = getDevelopment(next.developmentId);

  // Autoplay is off by default for reduced-motion visitors.
  useEffect(() => {
    if (reduce) setUserPaused(true);
  }, [reduce]);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const go = useCallback(
    (target: number, direction?: number) => {
      setState((s) => {
        const i = (target + count) % count;
        if (i === s.index) return s;
        return { index: i, dir: direction ?? (target > s.index ? 1 : -1) };
      });
      progress.set(0);
    },
    [count, progress],
  );

  const playing = !userPaused && !hovered && !focused && !hidden;

  // Drive the progress bar from rAF via a motion value, so React doesn't re-render every frame.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const p = progress.get() + (t - last) / DURATION;
      last = t;
      if (p >= 1) {
        go(index + 1, 1);
        return;
      }
      progress.set(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, index, go, progress]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1, 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1, -1); }
  };

  return (
    <section
      id="top"
      aria-roledescription="carousel"
      aria-label="Featured land developments"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-[radial-gradient(ellipse_at_70%_30%,#24372B,#111714_70%)] text-white outline-none lg:h-[94vh] lg:min-h-[720px]"
    >
      {/* ── Imagery ─────────────────────────────────────────── */}
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={slide.id}
          custom={dir}
          className="absolute inset-0"
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: `${dir * 6}%` }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: `${dir * -3}%` }}
          transition={{ duration: reduce ? 0.6 : 1.6, ease: EASE }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: reduce ? 1 : 1.1 }}
            animate={{ scale: reduce ? 1 : 1.0, x: reduce ? 0 : index % 2 ? "-1.2%" : "1.2%" }}
            transition={{ duration: (DURATION + 2500) / 1000, ease: "linear" }}
          >
            <Image
              src={dev.heroImage.src}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.focus }}
            />
          </motion.div>
          {slide.plotOverlay && <PlotGridOverlay reduce={!!reduce} />}
        </motion.div>
      </AnimatePresence>

      {/* Preload every slide so transitions never wait on the network */}
      <div className="hidden" aria-hidden>
        {heroSlides.slice(1).map((s) => (
          <Image key={s.id} src={getDevelopment(s.developmentId).heroImage.src} alt="" width={16} height={9} sizes="100vw" />
        ))}
      </div>

      {/* Readability: a tuned left wash + bottom fall-off, so the photo keeps its colour */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(17,23,20,0.78)_0%,rgba(17,23,20,0.45)_32%,rgba(17,23,20,0)_62%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-[linear-gradient(0deg,rgba(17,23,20,0.92)_0%,rgba(17,23,20,0.55)_38%,rgba(17,23,20,0)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(17,23,20,0.55),rgba(17,23,20,0))]" />

      {/* ── Copy ───────────────────────────────────────────── */}
      <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-[208px] md:px-10 md:pb-[150px] lg:pb-[132px]">
        <div
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${count}: ${slide.chapter}`}
          className="max-w-[54rem]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={slide.id} initial="hidden" animate="show" exit="exit">
              <motion.div variants={fade(0)} className="label mb-6 flex items-center gap-3 text-white/75">
                <span className="tabular-nums text-lime">{pad(index + 1)}</span>
                <span className="h-px w-10 bg-white/40" />
                {slide.chapter}
              </motion.div>
              <h1 className="display text-[clamp(3rem,8.2vw,8.75rem)] font-medium">
                {slide.headline.map((line, i) => (
                  <span key={line} className="block overflow-hidden pb-[0.06em]">
                    <motion.span className="block" variants={rise(0.08 + i * 0.1, reduce)}>
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <motion.p variants={fade(0.38)} className="mt-7 max-w-[30rem] text-[0.98rem] leading-relaxed text-white/80 md:text-[1.05rem]">
                {slide.body}
              </motion.p>
              <motion.div variants={fade(0.5)} className="mt-8">
                <a
                  href={slide.cta.href}
                  className="group inline-flex items-center gap-4 bg-ivory py-3.5 pl-6 pr-5 text-[0.875rem] font-medium text-charcoal transition-colors duration-300 hover:bg-lime"
                >
                  {slide.cta.label}
                  <Arrow className="h-4 w-4 transition-transform duration-500 ease-cine group-hover:translate-x-1" />
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Controls (lower right) ─────────────────────────── */}
      <div className="absolute inset-x-5 bottom-[100px] flex items-end justify-end gap-6 md:inset-x-auto md:right-10 lg:bottom-[96px]">
        {/* next-slide preview */}
        <button
          type="button"
          onClick={() => go(index + 1, 1)}
          className="group hidden w-[200px] text-left xl:block"
          aria-label={`Next slide: ${next.chapter}`}
        >
          <div className="label mb-2 flex justify-between text-white/55">
            <span>Next</span>
            <span className="tabular-nums">{pad(((index + 1) % count) + 1)}</span>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden border border-white/20">
            <AnimatePresence initial={false}>
              <motion.div
                key={next.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: EASE }}
              >
                <Image src={nextDev.heroImage.src} alt="" fill sizes="200px" className="object-cover transition-transform duration-[1.4s] ease-cine group-hover:scale-105" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-2 truncate text-[0.8rem] text-white/80">{next.chapter}</div>
        </button>

        <div className="flex w-full items-end justify-between md:w-auto md:flex-col md:items-end md:gap-4">
          <div className="flex flex-col items-start gap-1 md:items-end md:gap-4">
          <div className="flex items-baseline gap-2 font-display tabular-nums" aria-hidden>
            <span className="relative inline-block h-[1.9rem] w-[2.4ch] overflow-hidden text-[1.75rem] leading-none">
              <AnimatePresence initial={false} custom={dir}>
                <motion.span
                  key={index}
                  className="absolute inset-0"
                  initial={{ y: `${dir * 100}%` }}
                  animate={{ y: "0%" }}
                  exit={{ y: `${dir * -100}%` }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  {pad(index + 1)}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="text-sm text-white/50">/ {pad(count)}</span>
          </div>

          <div className="flex gap-1.5">
            {heroSlides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}: ${s.chapter}`}
                aria-current={i === index}
                className="group relative py-3"
              >
                <span className="block h-px w-9 bg-white/25 md:w-12">
                  <ProgressFill active={i === index} done={i < index} progress={progress} />
                </span>
              </button>
            ))}
          </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              className="label mr-2 flex h-11 items-center gap-2 px-1 text-white/60 transition-colors hover:text-white"
              aria-label={userPaused ? "Start autoplay" : "Pause autoplay"}
            >
              {userPaused ? (
                <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden><path d="M2 1l7 4-7 4z" fill="currentColor" /></svg>
              ) : (
                <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden><path d="M2 1h2v8H2zM6 1h2v8H6z" fill="currentColor" /></svg>
              )}
              <span className="hidden sm:inline">{userPaused ? "Play" : "Pause"}</span>
            </button>
            <CtrlButton label="Previous slide" onClick={() => go(index - 1, -1)} dir="left" />
            <CtrlButton label="Next slide" onClick={() => go(index + 1, 1)} dir="right" />
          </div>
        </div>
      </div>

      {/* ── Floating development info strip ────────────────── */}
      <div className="absolute inset-x-0 bottom-0 border-t border-white/12 bg-charcoal/35 backdrop-blur-md">
        <div className="mx-auto grid h-[84px] max-w-[1600px] grid-cols-2 items-center gap-x-6 px-5 sm:grid-cols-3 md:px-10 lg:grid-cols-[1.3fr_1.1fr_0.8fr_1fr_1.4fr_auto]">
          <InfoCell k="Development" v={dev.name} id={dev.id} strong />
          <InfoCell k="Location" v={`${dev.city}, ${dev.state}`} id={dev.id} className="hidden sm:block" />
          <InfoCell k="Site acreage" v={formatAcres(dev.acreage)} id={dev.id} className="hidden lg:block" />
          <InfoCell k="Plots" v={formatPlots(dev.plotCount)} id={dev.id} className="hidden lg:block" />
          <div className="hidden lg:block">
            <div className="label mb-1.5 text-white/45">Status</div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={dev.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2.5 whitespace-nowrap text-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                {dev.status}
                {!dev.verified && <SampleTag />}
              </motion.div>
            </AnimatePresence>
          </div>
          <a href="#developments" className="group hidden items-center gap-3 justify-self-end text-white/60 hover:text-white lg:flex">
            <span className="label">Scroll to Explore</span>
            <span className="relative h-8 w-px overflow-hidden bg-white/20">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-lime motion-reduce:animate-none" />
            </span>
          </a>
          <div className="text-right sm:hidden">
            <a href="#developments" className="label text-white/55">Scroll ↓</a>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live={playing ? "off" : "polite"} aria-atomic>
        Slide {index + 1} of {count}: {slide.headline.join(" ")} — {dev.name}, {dev.city}, {dev.state}
      </p>

      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}60%,100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}

function ProgressFill({ active, done, progress }: { active: boolean; done: boolean; progress: MotionValue<number> }) {
  if (active)
    return <motion.span className="block h-full origin-left bg-lime" style={{ scaleX: progress }} />;
  return (
    <span
      className={`block h-full origin-left bg-white/80 transition-transform duration-700 ease-cine ${done ? "scale-x-100" : "scale-x-0"}`}
    />
  );
}

function CtrlButton({ label, onClick, dir }: { label: string; onClick: () => void; dir: "left" | "right" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group grid h-11 w-11 place-items-center border border-white/30 text-white transition-colors duration-300 hover:border-lime hover:bg-lime hover:text-charcoal"
    >
      <Arrow dir={dir} className={`h-4 w-4 transition-transform duration-500 ${dir === "right" ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"}`} />
    </button>
  );
}

function InfoCell({ k, v, id, strong, className = "" }: { k: string; v: string; id: string; strong?: boolean; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="label mb-1.5 text-white/45">{k}</div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          className={`truncate ${strong ? "font-display text-[1.05rem] tracking-tight" : "text-sm text-white/90"}`}
        >
          {v}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Faint subdivision lines that draw themselves over the "Planned Community" slide. */
function PlotGridOverlay({ reduce }: { reduce: boolean }) {
  const lines = [
    "M 980 260 L 1480 300 L 1440 720 L 930 690 Z",
    "M 1230 280 L 1190 705",
    "M 955 475 L 1460 510",
    "M 1105 270 L 1060 698",
    "M 1355 290 L 1315 712",
  ];
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 hidden h-full w-full md:block" aria-hidden>
      {lines.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="#D9E8A6"
          strokeWidth={i === 0 ? 1.4 : 0.9}
          strokeDasharray={i === 0 ? undefined : "6 6"}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: reduce ? 1 : 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: i === 0 ? 0.8 : 0.5 }}
          transition={{ delay: 1.0 + i * 0.25, duration: reduce ? 0.3 : 1.8, ease: EASE }}
        />
      ))}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6, duration: 1 }}>
        <text x="994" y="250" fill="#D9E8A6" fontSize="13" letterSpacing="2.5" fontFamily="var(--font-inter)">
          ILLUSTRATIVE LOT LAYOUT
        </text>
      </motion.g>
    </svg>
  );
}

const fade = (delay: number) => ({
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { delay, duration: 0.9, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.35, ease: EASE } },
});

const rise = (delay: number, reduce: boolean | null) => ({
  hidden: reduce ? { opacity: 0 } : { y: "105%" },
  show: { y: "0%", opacity: 1, transition: { delay, duration: 1.05, ease: EASE } },
  exit: reduce ? { opacity: 0 } : { y: "-105%", transition: { duration: 0.45, ease: [0.55, 0, 0.75, 0.2] as const } },
});
