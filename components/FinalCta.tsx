"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { images } from "@/lib/data";
import { Arrow } from "./ui";

export default function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const clip = useTransform(scrollYProgress, [0, 0.4], reduce ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"] : ["inset(8% 6% 8% 6%)", "inset(0% 0% 0% 0%)"]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.15, 1]);

  return (
    <section ref={ref} className="relative bg-charcoal" aria-labelledby="cta-title">
      <motion.div className="relative h-[92svh] min-h-[600px] overflow-hidden" style={{ clipPath: clip }}>
        <motion.div className="absolute inset-0" style={{ scale }}>
          <Image src={images.finalCta.src} alt={images.finalCta.alt} fill sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(17,23,20,0.85)_0%,rgba(17,23,20,0.2)_55%,rgba(17,23,20,0.35)_100%)]" />
        <div className="relative mx-auto flex h-full max-w-[1600px] flex-col items-start justify-end px-5 pb-16 md:px-10 md:pb-24">
          <motion.h2
            id="cta-title"
            className="display max-w-5xl text-[clamp(3rem,8vw,8.5rem)] font-medium text-white"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Your Next Move Starts With Land.
          </motion.h2>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="max-w-sm text-[1.02rem] leading-relaxed text-white/80">
              Explore the development. Discover the plots. Find your opportunity.
            </p>
            <a
              href="#developments"
              className="group inline-flex items-center gap-4 bg-lime py-4 pl-7 pr-6 text-sm font-medium text-charcoal transition-colors hover:bg-ivory"
            >
              Explore Available Land
              <Arrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
