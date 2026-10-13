/**
 * ILLUSTRATIVE master plan geometry — a 4.00-acre demonstration parcel.
 *
 * Coordinates are in feet (x → east, y → south), so polygon areas are real
 * square-footage for this drawing. Replace with geometry from the verified
 * boundary survey and recorded subdivision plat before publishing.
 */

export type PlotStatus = "available" | "reserved" | "sold";
export type Pt = [number, number];

export const SITE = { width: 440, depth: 396 } as const; // 174,240 sq ft = 4.00 ac
export const VIEWBOX = { x: -28, y: -28, w: 496, h: 476 } as const;

/** Cul-de-sac bulb */
export const CUL = { cx: 220, cy: 120, r: 45, island: 14 } as const;
/** Spine road right-of-way, 40 ft */
export const ROAD = { x1: 200, x2: 240 } as const;

const arc = (deg: number): Pt => {
  const t = (deg * Math.PI) / 180;
  return [+(CUL.cx + CUL.r * Math.cos(t)).toFixed(2), +(CUL.cy + CUL.r * Math.sin(t)).toFixed(2)];
};
// where the 40' road edges meet the bulb
const joinL = arc(116.39);
const joinR = arc(63.61);

export interface PlotDoc {
  name: string;
  state: "Proposed" | "Pending" | "Sample" | "Reference";
}

export interface Plot {
  id: string;
  number: string;
  poly: Pt[];
  status: PlotStatus;
  /** USD — sample pricing only */
  price: number;
  frontage: string;
  note: string;
  docs: PlotDoc[];
}

const baseDocs: PlotDoc[] = [
  { name: "Preliminary subdivision plat", state: "Proposed" },
  { name: "Boundary & topographic survey", state: "Pending" },
  { name: "Zoning & permitted-use summary", state: "Reference" },
  { name: "Utility availability letters", state: "Pending" },
];

const rect = (x1: number, y1: number, x2: number, y2: number): Pt[] => [
  [x1, y1],
  [x2, y1],
  [x2, y2],
  [x1, y2],
];

export const plots: Plot[] = [
  {
    id: "p01",
    number: "01",
    poly: [[0, 0], [130, 0], arc(225), arc(195), arc(165), arc(140), joinL, [200, 165], [0, 165]],
    status: "available",
    price: 262000,
    frontage: "Cul-de-sac frontage",
    note: "Corner homesite bordering the retained northern tree line.",
    docs: baseDocs,
  },
  {
    id: "p02",
    number: "02",
    poly: [[130, 0], [310, 0], arc(315), arc(292.5), arc(270), arc(247.5), arc(225)],
    status: "reserved",
    price: 189000,
    frontage: "Cul-de-sac frontage",
    note: "Pie-shaped lot widening toward the rear woodland edge.",
    docs: baseDocs,
  },
  {
    id: "p03",
    number: "03",
    poly: [[310, 0], [440, 0], [440, 165], [240, 165], joinR, arc(40), arc(15), arc(345), arc(315)],
    status: "available",
    price: 269000,
    frontage: "Cul-de-sac frontage",
    note: "Largest homesite in the plan, with an elevated northeast corner.",
    docs: baseDocs,
  },
  { id: "p04", number: "04", poly: rect(240, 165, 440, 223), status: "sold", price: 168000, frontage: "58 ft", note: "Interior homesite with east-facing rear yard.", docs: baseDocs },
  { id: "p05", number: "05", poly: rect(240, 223, 440, 281), status: "available", price: 159000, frontage: "58 ft", note: "Level interior lot adjoining the rear utility easement.", docs: baseDocs },
  { id: "p06", number: "06", poly: rect(240, 281, 440, 339), status: "available", price: 162000, frontage: "58 ft", note: "Interior homesite near the community entry.", docs: baseDocs },
  { id: "p07", number: "07", poly: rect(240, 339, 440, 396), status: "reserved", price: 166000, frontage: "57 ft", note: "Entry homesite facing the landscaped frontage.", docs: baseDocs },
  { id: "p08", number: "08", poly: rect(0, 279, 200, 336), status: "available", price: 164000, frontage: "57 ft", note: "Backs onto the open-space and stormwater area.", docs: baseDocs },
  { id: "p09", number: "09", poly: rect(0, 222, 200, 279), status: "sold", price: 158000, frontage: "57 ft", note: "Interior homesite on the western side.", docs: baseDocs },
  { id: "p10", number: "10", poly: rect(0, 165, 200, 222), status: "available", price: 163000, frontage: "57 ft", note: "Western homesite with a short walk to the cul-de-sac.", docs: baseDocs },
];

export const openSpace: Pt[] = rect(0, 336, 200, 396);

export const roadPath = [
  `M ${ROAD.x1} ${SITE.depth}`,
  `L ${joinL[0]} ${joinL[1]}`,
  `A ${CUL.r} ${CUL.r} 0 1 1 ${joinR[0]} ${joinR[1]}`,
  `L ${ROAD.x2} ${SITE.depth}`,
  "Z",
].join(" ");

export const toPath = (poly: Pt[]) => `M ${poly.map((p) => p.join(" ")).join(" L ")} Z`;

/** Shoelace area, sq ft */
export const area = (poly: Pt[]) => {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s / 2);
};

export const centroid = (poly: Pt[]): Pt => {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    const f = x1 * y2 - x2 * y1;
    a += f;
    cx += (x1 + x2) * f;
    cy += (y1 + y2) * f;
  }
  a /= 2;
  return [cx / (6 * a), cy / (6 * a)];
};

export const bbox = (poly: Pt[]) => {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
};

export const sqft = (p: Plot) => Math.round(area(p.poly));
export const acres = (p: Plot) => area(p.poly) / 43560;

export const statusMeta: Record<PlotStatus, { label: string }> = {
  available: { label: "Available" },
  reserved: { label: "Reserved" },
  sold: { label: "Sold" },
};

export const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const planMeta = {
  developmentId: "willow-creek",
  parcel: "North Parcel — Phase I",
  totalAcres: (SITE.width * SITE.depth) / 43560,
  zoning: "Single-family residential (sample)",
  disclaimer:
    "Illustrative plan for demonstration only. Lot lines, areas, prices and statuses are sample data and will be replaced with the verified boundary survey and recorded subdivision plat.",
};
