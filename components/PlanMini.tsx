import { CUL, openSpace, plots, roadPath, SITE, toPath } from "@/lib/siteplan";

/** Small locator diagram: where a plot sits within the overall development. */
export default function PlanMini({ highlight, className = "", tone = "dark" }: { highlight?: string; className?: string; tone?: "dark" | "light" }) {
  const line = tone === "dark" ? "rgba(244,242,235,0.45)" : "rgba(17,23,20,0.4)";
  return (
    <svg viewBox={`-8 -8 ${SITE.width + 16} ${SITE.depth + 16}`} className={className} aria-hidden>
      <rect x={0} y={0} width={SITE.width} height={SITE.depth} fill="none" stroke={line} strokeWidth={3} />
      <path d={toPath(openSpace)} fill={line} opacity={0.18} />
      <path d={roadPath} fill={line} opacity={0.35} />
      <circle cx={CUL.cx} cy={CUL.cy} r={CUL.island} fill="none" stroke={line} strokeWidth={2} />
      {plots.map((p) => (
        <path
          key={p.id}
          d={toPath(p.poly)}
          fill={p.id === highlight ? "#D9E8A6" : "transparent"}
          stroke={p.id === highlight ? "#D9E8A6" : line}
          strokeWidth={p.id === highlight ? 4 : 1.5}
        />
      ))}
    </svg>
  );
}
