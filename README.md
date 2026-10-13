# Fieldline Land Co. — Homepage (v1, cinematic carousel)

Image-led homepage for a US land-development company: cinematic hero carousel, development carousel, interactive SVG master plan, scroll-driven boundary reveal, plot showcase, location, planning/transparency and footer.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Motion for React · `next/image`

## Run it

```bash
npm install
npm run dev        # http://localhost:3101
npm run build      # production build
npm start          # serve the build on :3101
```

Requires Node 18.18+ (built with Node 22).

## Where things live

| Path | What it is |
| --- | --- |
| `lib/data.ts` | All content: company details, developments, hero slides, images, showcase plots, surroundings |
| `lib/siteplan.ts` | Master-plan geometry (feet), plot statuses, sample prices, documents, disclaimer |
| `lib/plot-context.tsx` | Shared plot selection ("View on Master Plan" → selects + zooms the map) |
| `components/HeroCarousel.tsx` | Full-screen carousel: Ken Burns, crossfades, progress bars, keyboard/swipe, autoplay pause |
| `components/DevelopmentsCarousel.tsx` | "Explore the Land." horizontal scroll-snap carousel |
| `components/MasterPlan.tsx` | Interactive plan: pan, zoom, pinch, filters, plot details, mobile bottom sheet |
| `components/BiggerPicture.tsx` | Parallax aerial with scroll-drawn boundary overlay |
| `components/PlotShowcase.tsx`, `Location.tsx`, `Planning.tsx`, `FinalCta.tsx`, `Footer.tsx` | Remaining sections |
| `app/globals.css` | Design tokens (colours, fonts, easing) |

## Before launch

- **Replace sample data.** Development names, acreages, plot counts, prices, statuses and drive times are placeholders and are labelled "Sample data" / "To be verified" on the page.
- **Replace the plan geometry** in `lib/siteplan.ts` with the verified boundary survey and recorded subdivision plat. Plot areas are computed from the polygons.
- **Company name and contact details** ("Fieldline Land Co.") are placeholders in `lib/data.ts` and `components/ui.tsx` (wordmark).
- **Photography** is from Unsplash and only represents the setting. Swap in real site photography.
- The Bigger Picture overlay coordinates are tied to the current photo's framing (16:9, mirrored). Re-plot them if you change that image.
# design-2
