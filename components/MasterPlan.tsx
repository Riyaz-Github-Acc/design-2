"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { getDevelopment, images } from "@/lib/data";
import { usePlotSelection } from "@/lib/plot-context";
import {
  acres, centroid, CUL, openSpace, planMeta, plots, ROAD, roadPath, SITE, sqft, statusMeta, toPath, usd, VIEWBOX,
  type Plot, type PlotStatus, type Pt,
} from "@/lib/siteplan";
import { Arrow, SampleTag, SectionLabel } from "./ui";

type View = { s: number; x: number; y: number };
const MIN = 1, MAX = 5;
const STATUSES: PlotStatus[] = ["available", "reserved", "sold"];
const dev = getDevelopment(planMeta.developmentId);

const fills: Record<PlotStatus, string> = {
  available: "rgba(217,232,166,0.22)",
  reserved: "url(#reserved)",
  sold: "url(#sold)",
};

function useIsDesktop() {
  const [v, setV] = useState(true);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const on = () => setV(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return v;
}

export default function MasterPlan() {
  const { selectedId, select, locateTick } = usePlotSelection();
  const isDesktop = useIsDesktop();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<PlotStatus, boolean>>({ available: true, reserved: true, sold: true });
  const [view, setView] = useState<View>({ s: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [size, setSize] = useState({ w: 1, h: 1 });
  const [hint, setHint] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(true);
  const dragControls = useDragControls();
  const vp = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const suppressClick = useRef(false);

  const selected = plots.find((p) => p.id === selectedId) ?? null;
  useEffect(() => setSheetOpen(true), [selectedId, locateTick]);
  const k = size.w / VIEWBOX.w; // px per foot at scale 1

  useEffect(() => {
    const el = vp.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clamp = useCallback(
    (v: View): View => {
      const s = Math.min(MAX, Math.max(MIN, v.s));
      return {
        s,
        x: Math.min(0, Math.max(size.w - size.w * s, v.x)),
        y: Math.min(0, Math.max(size.h - size.h * s, v.y)),
      };
    },
    [size],
  );

  const zoomAt = useCallback(
    (factor: number, cx = size.w / 2, cy = size.h / 2) => {
      setView((v) => {
        const s = Math.min(MAX, Math.max(MIN, v.s * factor));
        const r = s / v.s;
        return clamp({ s, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r });
      });
    },
    [clamp, size],
  );

  const locate = useCallback(
    (p: Plot) => {
      const [cx, cy] = centroid(p.poly);
      const px = (cx - VIEWBOX.x) * k;
      const py = (cy - VIEWBOX.y) * k;
      setView((v) => {
        const s = Math.max(v.s, 2.4);
        return clamp({ s, x: size.w / 2 - px * s, y: size.h / 2 - py * s });
      });
      setPulse((n) => n + 1);
      vp.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    [clamp, k, size],
  );

  // Fly to the plot when another section asks ("View on Master Plan").
  useEffect(() => {
    if (!locateTick || !selectedId) return;
    const p = plots.find((q) => q.id === selectedId);
    if (p) {
      const t = setTimeout(() => locate(p), 450);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locateTick]);

  // Ctrl/⌘ + wheel (and trackpad pinch) zooms; plain wheel keeps scrolling the page.
  useEffect(() => {
    const el = vp.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) {
        setHint(true);
        clearTimeout(t);
        t = setTimeout(() => setHint(false), 1400);
        return;
      }
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const d = Math.max(-60, Math.min(60, e.deltaY));
      zoomAt(Math.exp(-d * 0.01), e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(t);
    };
  }, [zoomAt]);

  // Pointer pan + two-finger pinch
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const el = vp.current!;
    const rect = el.getBoundingClientRect();
    const pts = new Map<number, { x: number; y: number }>();
    const rel = (ev: PointerEvent | React.PointerEvent) => ({ x: ev.clientX - rect.left, y: ev.clientY - rect.top });
    pts.set(e.pointerId, rel(e));
    let start = { view: viewRef.current, pts: new Map(pts) };
    let moved = false;

    const reset = () => (start = { view: viewRef.current, pts: new Map(pts) });

    const move = (ev: PointerEvent) => {
      if (!pts.has(ev.pointerId)) return;
      pts.set(ev.pointerId, rel(ev));
      const cur = [...pts.values()];
      const st = [...start.pts.values()];
      if (cur.length === 1 && st.length === 1) {
        const dx = cur[0].x - st[0].x, dy = cur[0].y - st[0].y;
        if (!moved && Math.hypot(dx, dy) < 5) return;
        moved = true;
        setDragging(true);
        setView(clamp({ s: start.view.s, x: start.view.x + dx, y: start.view.y + dy }));
      } else if (cur.length >= 2 && st.length >= 2) {
        moved = true;
        setDragging(true);
        const d0 = Math.hypot(st[0].x - st[1].x, st[0].y - st[1].y) || 1;
        const d1 = Math.hypot(cur[0].x - cur[1].x, cur[0].y - cur[1].y);
        const m0 = { x: (st[0].x + st[1].x) / 2, y: (st[0].y + st[1].y) / 2 };
        const m1 = { x: (cur[0].x + cur[1].x) / 2, y: (cur[0].y + cur[1].y) / 2 };
        const s = Math.min(MAX, Math.max(MIN, start.view.s * (d1 / d0)));
        const fx = (m0.x - start.view.x) / start.view.s;
        const fy = (m0.y - start.view.y) / start.view.s;
        setView(clamp({ s, x: m1.x - fx * s, y: m1.y - fy * s }));
      }
    };
    const down = (ev: PointerEvent) => {
      pts.set(ev.pointerId, rel(ev));
      reset();
    };
    const up = (ev: PointerEvent) => {
      pts.delete(ev.pointerId);
      if (pts.size > 0) return reset();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerdown", down);
      setDragging(false);
      if (moved) {
        suppressClick.current = true;
        setTimeout(() => (suppressClick.current = false), 0);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("pointerdown", down);
  };

  const choose = (p: Plot) => {
    if (suppressClick.current) return;
    select(p.id);
  };

  const counts = useMemo(
    () => Object.fromEntries(STATUSES.map((s) => [s, plots.filter((p) => p.status === s).length])) as Record<PlotStatus, number>,
    [],
  );
  const scaleBarPx = 100 * k * view.s; // 100 ft

  return (
    <section id="master-plan" className="relative scroll-mt-16 bg-[#0e1310] py-24 text-ivory md:py-32" aria-labelledby="plan-title">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <SectionLabel index="02" className="mb-8 text-stone">Interactive Master Plan</SectionLabel>
            <h2 id="plan-title" className="display text-[clamp(2.6rem,6vw,6rem)] font-medium">
              One Property.
              <br />
              <span className="text-lime">Many Possibilities.</span>
            </h2>
          </div>
          <div className="max-w-lg">
            <p className="text-[1.02rem] leading-relaxed text-stone">
              A larger parcel is divided into individual plots following the applicable subdivision plan — each with its own
              boundaries, frontage and documentation. Explore the {planMeta.parcel.toLowerCase()} of {dev.name} below.
            </p>
            <a
              href="#plan-explorer"
              className="group mt-7 inline-flex items-center gap-4 border border-white/25 py-3.5 pl-6 pr-5 text-sm transition-colors duration-300 hover:border-lime hover:bg-lime hover:text-charcoal"
            >
              Explore the Master Plan
              <Arrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        <div id="plan-explorer" className="mt-16 grid scroll-mt-24 gap-8 lg:mt-20 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-12">
          {/* ── Map ── */}
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter plots by status">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={filters[s]}
                    onClick={() => setFilters((f) => ({ ...f, [s]: !f[s] }))}
                    className={`flex items-center gap-2.5 border px-3.5 py-2 text-[0.8rem] transition-colors duration-300 ${
                      filters[s] ? "border-white/35 text-ivory" : "border-white/10 text-white/40"
                    }`}
                  >
                    <StatusSwatch status={s} dim={!filters[s]} />
                    {statusMeta[s].label}
                    <span className="tabular-nums text-white/45">{counts[s]}</span>
                  </button>
                ))}
              </div>
              <span className="label text-white/45">Parcel {planMeta.totalAcres.toFixed(2)} ac · {plots.length} plots</span>
            </div>

            <div
              ref={vp}
              onPointerDown={onPointerDown}
              className={`relative w-full select-none overflow-hidden border border-white/12 bg-[#151d18] ${
                view.s > 1 ? "touch-none" : "touch-pan-y"
              } ${dragging ? "cursor-grabbing" : view.s > 1 ? "cursor-grab" : ""}`}
              style={{ aspectRatio: `${VIEWBOX.w} / ${VIEWBOX.h}` }}
            >
              <div
                className="absolute inset-0 origin-top-left will-change-transform"
                style={{
                  transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`,
                  transition: dragging ? "none" : "transform 0.8s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <svg
                  viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`}
                  className="h-full w-full"
                  role="group"
                  aria-label={`Illustrative master plan of ${planMeta.parcel}, ${plots.length} plots`}
                >
                  <PlanDefs />
                  <PlanBase />
                  {/* Plots */}
                  {plots.map((p) => {
                    const visible = filters[p.status];
                    const isSel = p.id === selectedId;
                    const isHover = p.id === hoverId;
                    const [cx, cy] = centroid(p.poly);
                    return (
                      <g
                        key={p.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSel}
                        aria-label={`Plot ${p.number}, ${statusMeta[p.status].label}, ${sqft(p).toLocaleString()} square feet, ${usd(p.price)} sample price`}
                        onClick={() => choose(p)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            select(p.id);
                          }
                        }}
                        onPointerEnter={() => setHoverId(p.id)}
                        onPointerLeave={() => setHoverId((h) => (h === p.id ? null : h))}
                        onFocus={() => setHoverId(p.id)}
                        onBlur={() => setHoverId(null)}
                        className="cursor-pointer outline-none"
                        style={{ opacity: visible ? 1 : 0.16, transition: "opacity .5s" }}
                      >
                        <path
                          d={toPath(p.poly)}
                          fill={isSel ? "rgba(217,232,166,0.55)" : fills[p.status]}
                          stroke={isSel || isHover ? "#D9E8A6" : "rgba(244,242,235,0.7)"}
                          strokeWidth={isSel ? 2.6 : isHover ? 2 : 0.9}
                          strokeLinejoin="round"
                          style={{ transition: "fill .35s, stroke .25s, stroke-width .25s" }}
                        />
                        {isHover && !isSel && <path d={toPath(p.poly)} fill="rgba(217,232,166,0.12)" pointerEvents="none" />}
                        <text x={cx} y={cy - 2} textAnchor="middle" className="font-display" fontSize={15} fontWeight={500} fill={isSel ? "#111714" : "#F4F2EB"} pointerEvents="none">
                          {p.number}
                        </text>
                        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={7.5} letterSpacing={0.6} fill={isSel ? "#111714" : "rgba(244,242,235,0.6)"} pointerEvents="none">
                          {acres(p).toFixed(2)} AC
                        </text>
                      </g>
                    );
                  })}
                  {selected && <Dimensions plot={selected} />}
                  {selected && (
                    <circle
                      key={pulse}
                      cx={centroid(selected.poly)[0]}
                      cy={centroid(selected.poly)[1]}
                      r={10}
                      fill="none"
                      stroke="#D9E8A6"
                      strokeWidth={1.5}
                      pointerEvents="none"
                      className="motion-safe:animate-[locate_1.6s_ease-out_2]"
                      style={{ transformBox: "fill-box", transformOrigin: "center", opacity: 0 }}
                    />
                  )}
                </svg>
              </div>

              {/* Fixed overlays (not zoomed) */}
              <div className="pointer-events-none absolute left-3 top-3 md:left-4 md:top-4">
                <span className="label inline-block border border-lime/40 bg-charcoal/75 px-2 py-1 !text-[0.6rem] text-lime backdrop-blur">
                  Illustrative plan<span className="hidden sm:inline"> · not a recorded plat</span>
                </span>
              </div>
              <div className="absolute right-3 top-3 flex flex-col border border-white/15 bg-charcoal/80 backdrop-blur md:right-4 md:top-4">
                <MapBtn label="Zoom in" onClick={() => zoomAt(1.5)}>+</MapBtn>
                <MapBtn label="Zoom out" onClick={() => zoomAt(1 / 1.5)}>−</MapBtn>
                <MapBtn label="Reset view" onClick={() => setView({ s: 1, x: 0, y: 0 })}>
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" stroke="currentColor" fill="none" /></svg>
                </MapBtn>
              </div>
              <div className="pointer-events-none absolute bottom-3 left-3 flex items-end gap-4 md:bottom-4 md:left-4">
                <svg viewBox="0 0 20 30" className="h-7 w-5 text-ivory" aria-label="North">
                  <path d="M10 2 L16 22 L10 18 L4 22 Z" fill="currentColor" opacity=".85" />
                  <text x="10" y="30" textAnchor="middle" fontSize="7" fill="currentColor">N</text>
                </svg>
                <div>
                  <div className="h-1.5 border-x border-b border-ivory/80" style={{ width: Math.min(scaleBarPx, 220) }} />
                  <div className="label mt-1 !text-[0.58rem] text-white/60">
                    {scaleBarPx > 220 ? `${Math.round((220 / scaleBarPx) * 100)} ft` : "100 ft"}
                  </div>
                </div>
              </div>
              <AnimatePresence>
                {hint && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 grid place-items-center bg-charcoal/40"
                  >
                    <span className="bg-charcoal/90 px-4 py-2 text-sm">Hold Ctrl / ⌘ and scroll to zoom</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="mt-3 flex items-center justify-between gap-4 text-xs text-white/45">
              <span className="hidden md:inline">Drag to pan · Ctrl/⌘ + scroll or use +/− to zoom · Tab through plots with the keyboard</span>
              <span className="md:hidden">Pinch to zoom · drag to pan · tap a plot</span>
              <span className="tabular-nums">{Math.round(view.s * 100)}%</span>
            </p>
          </div>

          {/* ── Info panel (desktop) ── */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <AnimatePresence mode="wait" initial={false}>
                {selected ? (
                  <PlotDetail key={selected.id} plot={selected} onLocate={() => locate(selected)} onClose={() => select(null)} />
                ) : (
                  <Overview key="overview" onPick={(id) => select(id)} filters={filters} />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile: list inline, details in a bottom sheet */}
          <div className="lg:hidden">
            <Overview onPick={(id) => select(id)} filters={filters} />
          </div>
        </div>

        <p className="mt-10 max-w-3xl border-l border-lime/50 pl-4 text-xs leading-relaxed text-white/50">{planMeta.disclaimer}</p>
      </div>

      <AnimatePresence>
        {!isDesktop && selected && sheetOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-charcoal/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => select(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Plot ${selected.number} details`}
              className="fixed inset-x-0 bottom-0 z-[61] max-h-[82svh] overflow-y-auto overscroll-contain border-t border-white/15 bg-charcoal px-5 pb-8"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 34, stiffness: 320 }}
              drag="y"
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.7 }}
              onDragEnd={(_, info) => info.offset.y > 90 && select(null)}
            >
              <div
                className="sticky top-0 z-10 -mx-5 flex touch-none justify-center bg-charcoal pb-4 pt-3"
                onPointerDown={(e) => dragControls.start(e)}
                aria-hidden
              >
                <div className="h-1 w-10 rounded-full bg-white/25" />
              </div>
              <PlotDetail
                plot={selected}
                compact
                onClose={() => select(null)}
                onLocate={() => {
                  setSheetOpen(false);
                  vp.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  setTimeout(() => locate(selected), 350);
                }}
              />
            </motion.div>
          </>
        )}
        {!isDesktop && selected && !sheetOpen && (
          <motion.button
            type="button"
            onClick={() => setSheetOpen(true)}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-5 bottom-5 z-[61] flex items-center justify-between bg-lime px-5 py-4 text-sm font-medium text-charcoal"
          >
            <span>Plot {selected.number} · {usd(selected.price)}</span>
            <span className="flex items-center gap-2">Details <Arrow dir="up" className="h-4 w-4" /></span>
          </motion.button>
        )}
      </AnimatePresence>

      <style>{`@keyframes locate{0%{opacity:.9;transform:scale(.6)}100%{opacity:0;transform:scale(5)}}`}</style>
    </section>
  );
}

/* ───────────────────────── Plan drawing ───────────────────────── */

function PlanDefs() {
  return (
    <defs>
      <pattern id="sold" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="rgba(167,173,165,0.28)" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(17,23,20,0.55)" strokeWidth="2" />
      </pattern>
      <pattern id="reserved" width="7" height="7" patternUnits="userSpaceOnUse">
        <rect width="7" height="7" fill="rgba(244,242,235,0.1)" />
        <circle cx="3.5" cy="3.5" r="0.9" fill="rgba(244,242,235,0.55)" />
      </pattern>
      <radialGradient id="vignette" cx="50%" cy="45%" r="70%">
        <stop offset="60%" stopColor="#151d18" stopOpacity="0" />
        <stop offset="100%" stopColor="#151d18" stopOpacity="0.9" />
      </radialGradient>
    </defs>
  );
}

const trees: Pt[] = [
  [-14, -12], [8, -18], [40, -14], [78, -20], [118, -12], [170, -18], [214, -14], [262, -19], [300, -12], [348, -18], [392, -13], [430, -19], [455, -6],
  [456, 30], [452, 72], [458, 118], [454, 170], [458, 222], [452, 270], [457, 320], [454, 370],
  [-16, 40], [-12, 96], [-17, 150], [-13, 204], [-18, 260], [-14, 318], [-16, 372],
];

function PlanBase() {
  return (
    <g pointerEvents="none">
      {/* Aerial texture beneath the drawing, so the plan reads as land, not a diagram */}
      <image href={images.planTexture.src} x={VIEWBOX.x} y={VIEWBOX.y} width={VIEWBOX.w} height={VIEWBOX.h} preserveAspectRatio="xMidYMid slice" opacity={0.22} />
      <rect x={VIEWBOX.x} y={VIEWBOX.y} width={VIEWBOX.w} height={VIEWBOX.h} fill="url(#vignette)" />

      {/* Surrounding tree canopy (illustrative) */}
      {trees.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={7 + (i % 3) * 2} fill="rgba(36,55,43,0.85)" stroke="rgba(217,232,166,0.25)" strokeWidth={0.6} />
      ))}

      {/* Existing county road */}
      <rect x={VIEWBOX.x} y={410} width={VIEWBOX.w} height={26} fill="#222b25" />
      <line x1={VIEWBOX.x} y1={423} x2={VIEWBOX.x + VIEWBOX.w} y2={423} stroke="rgba(244,242,235,0.35)" strokeDasharray="8 7" strokeWidth={0.8} />
      <text x={330} y={445} fontSize={7} letterSpacing={1.6} fill="rgba(244,242,235,0.5)">EXISTING COUNTY ROAD</text>
      <rect x={ROAD.x1} y={396} width={ROAD.x2 - ROAD.x1} height={14} fill="#2b3730" />

      {/* Site lot (base fill) */}
      <rect x={0} y={0} width={SITE.width} height={SITE.depth} fill="rgba(17,23,20,0.35)" />

      {/* Open space + stormwater */}
      <path d={toPath(openSpace)} fill="rgba(36,55,43,0.9)" />
      <ellipse cx={88} cy={366} rx={52} ry={17} fill="rgba(120,150,140,0.35)" stroke="rgba(244,242,235,0.4)" strokeWidth={0.7} />
      <ellipse cx={88} cy={366} rx={38} ry={11} fill="none" stroke="rgba(244,242,235,0.2)" strokeWidth={0.6} />
      <text x={154} y={352} fontSize={6.5} letterSpacing={1.1} textAnchor="middle" fill="rgba(244,242,235,0.6)">OPEN SPACE</text>
      <text x={154} y={361} fontSize={6.5} letterSpacing={1.1} textAnchor="middle" fill="rgba(244,242,235,0.6)">STORMWATER</text>

      {/* Internal road + cul-de-sac */}
      <path d={roadPath} fill="#2b3730" stroke="rgba(244,242,235,0.55)" strokeWidth={0.9} />
      <line x1={220} y1={404} x2={220} y2={CUL.cy + CUL.island + 10} stroke="rgba(217,232,166,0.55)" strokeWidth={0.8} strokeDasharray="6 6" />
      <circle cx={CUL.cx} cy={CUL.cy} r={CUL.island} fill="rgba(36,55,43,0.95)" stroke="rgba(244,242,235,0.5)" strokeWidth={0.7} />
      <circle cx={CUL.cx} cy={CUL.cy} r={6} fill="rgba(217,232,166,0.35)" />
      <text x={236} y={330} fontSize={6} letterSpacing={1.4} fill="rgba(244,242,235,0.55)" transform="rotate(-90 236 330)">WILLOW CREEK LANE (PROPOSED)</text>

      {/* Entry monument */}
      <rect x={244} y={398} width={10} height={6} fill="#D9E8A6" opacity={0.7} />
      <rect x={186} y={398} width={10} height={6} fill="#D9E8A6" opacity={0.7} />

      {/* Utility easements */}
      <g stroke="rgba(217,232,166,0.4)" strokeWidth={0.7} strokeDasharray="3 3" fill="none">
        <line x1={10} y1={165} x2={10} y2={336} />
        <line x1={430} y1={10} x2={430} y2={396} />
        <line x1={0} y1={10} x2={440} y2={10} />
      </g>
      <text x={14} y={22} fontSize={5.5} letterSpacing={0.8} fill="rgba(217,232,166,0.7)">10&apos; UTILITY EASEMENT</text>

      {/* Property boundary — dash-dot convention */}
      <rect x={0} y={0} width={SITE.width} height={SITE.depth} fill="none" stroke="#F4F2EB" strokeWidth={1.8} strokeDasharray="14 4 2 4" />
      <text x={220} y={-8} fontSize={6.5} textAnchor="middle" letterSpacing={1.2} fill="rgba(244,242,235,0.7)">440.00&apos;</text>
      <text x={-9} y={198} fontSize={6.5} textAnchor="middle" letterSpacing={1.2} fill="rgba(244,242,235,0.7)" transform="rotate(-90 -9 198)">396.00&apos;</text>
    </g>
  );
}

/** Edge-length annotations for the selected plot, like a plat. */
function Dimensions({ plot }: { plot: Plot }) {
  const [cx, cy] = centroid(plot.poly);
  return (
    <g pointerEvents="none">
      {plot.poly.map((a, i) => {
        const b = plot.poly[(i + 1) % plot.poly.length];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len < 30) return null;
        let mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        // nudge label inward
        const dx = cx - mx, dy = cy - my, d = Math.hypot(dx, dy) || 1;
        mx += (dx / d) * 9;
        my += (dy / d) * 9;
        const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
        const rot = ang > 90 || ang < -90 ? ang + 180 : ang;
        return (
          <text key={i} x={mx} y={my + 2.5} fontSize={7} textAnchor="middle" fill="#111714" fontWeight={600} transform={`rotate(${rot} ${mx} ${my})`}>
            {len.toFixed(1)}&apos;
          </text>
        );
      })}
    </g>
  );
}

/* ───────────────────────── Panels ───────────────────────── */

function StatusSwatch({ status, dim }: { status: PlotStatus; dim?: boolean }) {
  const cls = {
    available: "bg-lime",
    reserved: "border border-ivory/70 bg-[radial-gradient(circle,rgba(244,242,235,.7)_1px,transparent_1.2px)] bg-[length:4px_4px]",
    sold: "bg-[repeating-linear-gradient(45deg,#A7ADA5_0_2px,transparent_2px_4px)]",
  }[status];
  return <span className={`inline-block h-2.5 w-2.5 ${cls} ${dim ? "opacity-40" : ""}`} aria-hidden />;
}

function StatusText({ status }: { status: PlotStatus }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <StatusSwatch status={status} />
      {statusMeta[status].label}
    </span>
  );
}

function Overview({ onPick, filters }: { onPick: (id: string) => void; filters: Record<PlotStatus, boolean> }) {
  const available = plots.filter((p) => p.status === "available");
  const minPrice = Math.min(...available.map((p) => p.price));
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }}>
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="label mb-3 text-stone">{dev.name}</div>
          <h3 className="font-display text-3xl tracking-tight">{planMeta.parcel}</h3>
          <p className="mt-2 text-sm text-stone">{dev.city}, {dev.state} · {dev.county}</p>
        </div>
        <SampleTag />
      </div>
      <dl className="grid grid-cols-3 border-b border-white/10">
        <Fact k="Parcel" v={`${planMeta.totalAcres.toFixed(2)} ac`} />
        <Fact k="Plots" v={String(plots.length)} />
        <Fact k="From" v={usd(minPrice)} />
      </dl>
      <p className="mt-6 text-sm text-stone">Select a plot on the plan — or from the list — to see its area, asking price and documents.</p>
      <ul className="mt-5 border-t border-white/10" aria-label="All plots">
        {plots.map((p) => (
          <li key={p.id} className={filters[p.status] ? "" : "hidden"}>
            <button
              type="button"
              onClick={() => onPick(p.id)}
              className="group grid w-full grid-cols-[2.5rem_1fr_1fr_7.5rem] items-center gap-3 border-b border-white/10 py-3 text-left text-sm transition-colors hover:bg-white/[0.03]"
            >
              <span className="font-display text-lg tabular-nums">{p.number}</span>
              <span className="tabular-nums text-stone">{sqft(p).toLocaleString()} sf</span>
              <span className="tabular-nums">{usd(p.price)}</span>
              <span className="flex items-center gap-3">
                <StatusText status={p.status} />
                <Arrow className="h-3.5 w-3.5 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-r border-white/10 py-5 pr-4 last:border-r-0 [&:not(:first-child)]:pl-4">
      <dt className="label mb-2 text-white/45">{k}</dt>
      <dd className="font-display text-xl tabular-nums tracking-tight">{v}</dd>
    </div>
  );
}

const docTone: Record<string, string> = {
  Proposed: "border-lime/50 text-lime",
  Pending: "border-white/25 text-white/60",
  Reference: "border-white/25 text-white/60",
  Sample: "border-white/25 text-white/60",
};

function PlotDetail({ plot, onLocate, onClose, compact }: { plot: Plot; onLocate: () => void; onClose: () => void; compact?: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: compact ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="label mb-3 flex items-center gap-3 text-stone">
            {dev.name} <SampleTag />
          </div>
          <h3 className="display text-[clamp(3rem,5vw,4.75rem)] font-medium">
            Plot <span className="text-lime">{plot.number}</span>
          </h3>
          <div className="mt-3"><StatusText status={plot.status} /></div>
        </div>
        <button type="button" onClick={onClose} className="label flex h-10 items-center gap-2 border border-white/20 px-3 text-white/70 hover:text-white" aria-label="Close plot details">
          <span aria-hidden>✕</span> {compact ? "" : "All plots"}
        </button>
      </div>

      <dl className="grid grid-cols-2 border-b border-white/10">
        <div className="border-b border-r border-white/10 py-5 pr-4">
          <dt className="label mb-2 text-white/45">Lot area</dt>
          <dd className="font-display text-2xl tabular-nums tracking-tight">{sqft(plot).toLocaleString()} <span className="text-base text-stone">sq ft</span></dd>
          <dd className="mt-1 text-sm tabular-nums text-stone">{acres(plot).toFixed(3)} acres</dd>
        </div>
        <div className="border-b border-white/10 py-5 pl-4">
          <dt className="label mb-2 text-white/45">Asking price</dt>
          <dd className="font-display text-2xl tabular-nums tracking-tight">{usd(plot.price)}</dd>
          <dd className="mt-1 text-sm text-stone">Sample pricing</dd>
        </div>
        <div className="border-r border-white/10 py-5 pr-4">
          <dt className="label mb-2 text-white/45">Frontage</dt>
          <dd className="text-sm">{plot.frontage}</dd>
        </div>
        <div className="py-5 pl-4">
          <dt className="label mb-2 text-white/45">Zoning</dt>
          <dd className="text-sm">{planMeta.zoning}</dd>
        </div>
      </dl>

      <p className="mt-5 text-sm leading-relaxed text-stone">{plot.note}</p>

      <div className="mt-6">
        <div className="label mb-3 text-white/45">Documents</div>
        <ul className="border-t border-white/10">
          {plot.docs.map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-3 border-b border-white/10 py-3 text-sm">
              <span className="flex items-center gap-3">
                <svg viewBox="0 0 16 16" className="h-4 w-4 text-white/50" aria-hidden><path d="M3.5 1.5h6l3 3v10h-9z M9.5 1.5v3h3" fill="none" stroke="currentColor" /></svg>
                {d.name}
              </span>
              <span className={`label border px-1.5 py-0.5 !text-[0.58rem] ${docTone[d.state]}`}>{d.state}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <button type="button" onClick={onLocate} className="group inline-flex items-center gap-3 border border-white/25 px-5 py-3 text-sm transition-colors hover:border-lime hover:text-lime">
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden><circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" /><path d="M8 0v4M8 12v4M0 8h4M12 8h4" stroke="currentColor" /></svg>
          Locate on plan
        </button>
        <a href="#contact" className="group inline-flex items-center gap-3 bg-lime px-5 py-3 text-sm font-medium text-charcoal">
          Request plot details <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </motion.article>
  );
}

function MapBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center border-b border-white/10 text-lg leading-none text-ivory transition-colors last:border-b-0 hover:bg-lime hover:text-charcoal"
    >
      {children}
    </button>
  );
}
