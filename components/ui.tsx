import type { SVGProps } from "react";

export function Arrow({ dir = "right", className = "", ...rest }: { dir?: "left" | "right" | "up" | "down" } & SVGProps<SVGSVGElement>) {
  const rot = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className} style={{ transform: `rotate(${rot}deg)` }} {...rest}>
      <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* parcel glyph: a quarter-section divided into four plots */}
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <rect x="2.5" y="2.5" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M12 2.5v19M2.5 12H21.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="12" y="12" width="9.5" height="9.5" fill="#D9E8A6" />
      </svg>
      <span className="font-display text-[1.05rem] font-medium tracking-[-0.02em]">
        Fieldline<span className="ml-1.5 font-normal opacity-60">Land Co.</span>
      </span>
    </span>
  );
}

export function SampleTag({ children = "Sample data", tone = "light" }: { children?: React.ReactNode; tone?: "light" | "dark" }) {
  return (
    <span
      className={`label inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border px-1.5 py-0.5 !text-[0.6rem] ${
        tone === "light" ? "border-white/25 text-white/70" : "border-charcoal/25 text-charcoal/60"
      }`}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function TextLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} className={`group inline-flex items-center gap-3 text-sm font-medium ${className}`}>
      <span className="relative">
        {children}
        <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-current opacity-40 transition-transform duration-500 ease-cine group-hover:opacity-100" />
      </span>
      <Arrow className="h-4 w-4 transition-transform duration-500 ease-cine group-hover:translate-x-1" />
    </a>
  );
}

export function SectionLabel({ index, children, className = "" }: { index: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`label flex items-center gap-3 ${className}`}>
      <span className="tabular-nums opacity-60">{index}</span>
      <span className="h-px w-8 bg-current opacity-40" />
      <span>{children}</span>
    </div>
  );
}
