"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Arrow, Wordmark } from "./ui";

const nav = [
  { label: "Developments", href: "#developments" },
  { label: "Explore Land", href: "#landscape" },
  { label: "Available Plots", href: "#plots" },
  { label: "Our Approach", href: "#approach" },
  { label: "About", href: "#about" },
];

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 text-white transition-[background-color,border-color,backdrop-filter] duration-500 ease-cine ${
        solid || open
          ? "border-b border-white/10 bg-charcoal/92 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:px-10 lg:h-[72px]">
        <a href="#top" aria-label="Fieldline Land Co. — home">
          <Wordmark />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {nav.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="relative text-[0.8125rem] text-white/80 transition-colors hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-lime after:transition-transform after:duration-500 hover:after:scale-x-100"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#master-plan"
            className="group hidden items-center gap-2.5 border border-white/35 px-4 py-2 text-[0.8125rem] transition-colors duration-300 hover:border-lime hover:bg-lime hover:text-charcoal sm:inline-flex"
          >
            Find Your Plot
            <Arrow className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5" />
          </a>
          <button
            type="button"
            className="relative h-10 w-10 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`absolute left-2.5 h-px w-5 bg-white transition-all duration-300 ${open ? "top-1/2 rotate-45" : "top-[16px]"}`} />
            <span className={`absolute left-2.5 h-px w-5 bg-white transition-all duration-300 ${open ? "top-1/2 -rotate-45" : "top-[23px]"}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
          >
            <ul className="px-5 pb-8 pt-4">
              {nav.map((n, i) => (
                <motion.li
                  key={n.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                  className="border-b border-white/10"
                >
                  <a href={n.href} onClick={() => setOpen(false)} className="flex items-center justify-between py-4 font-display text-2xl tracking-tight">
                    {n.label}
                    <Arrow className="h-5 w-5 opacity-50" />
                  </a>
                </motion.li>
              ))}
              <li className="pt-6">
                <a href="#master-plan" onClick={() => setOpen(false)} className="flex items-center justify-between bg-lime px-5 py-4 text-charcoal">
                  Find Your Plot <Arrow className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
