/**
 * Structured content for the homepage.
 *
 * Everything a visitor sees — slide imagery, headlines, development facts,
 * plot details — is defined here so it can be replaced with verified project
 * data (or wired to a CMS) without touching component code.
 *
 * Fields marked `verified: false` are rendered with a "Sample data" marker.
 */

export const company = {
  name: "Fieldline",
  suffix: "Land Co.",
  tagline: "Land, with a vision.",
  // Placeholder contact details — replace with real company information.
  email: "hello@example.com",
  phone: "(000) 000-0000",
  address: "Office address to be confirmed",
};

const unsplash = (id: string, w = 2400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export type DevelopmentStatus =
  | "Now Selling"
  | "Phase I Release"
  | "Coming Soon"
  | "Planning Review";

export interface Development {
  id: string;
  name: string;
  city: string;
  state: string;
  county: string;
  /** Total site acreage; null renders as "To be confirmed". */
  acreage: number | null;
  /** Number of approved plots; null until verified against the recorded plat. */
  plotCount: number | null;
  status: DevelopmentStatus;
  verified: boolean;
  summary: string;
  heroImage: { src: string; alt: string };
  cardImage: { src: string; alt: string };
}

export const developments: Development[] = [
  {
    id: "willow-creek",
    name: "Willow Creek Reserve",
    city: "Franklin",
    state: "TN",
    county: "Williamson County",
    acreage: 128,
    plotCount: 42,
    status: "Now Selling",
    verified: false,
    summary: "Rolling pasture and creekside hardwoods, planned as estate-sized homesites.",
    heroImage: {
      src: unsplash("1523741543316-beb7fc7023d8"),
      alt: "Rolling green farmland and hills stretching to the horizon",
    },
    cardImage: {
      src: unsplash("1501854140801-50d01698950b", 1800),
      alt: "Elevated view over layered green hills",
    },
  },
  {
    id: "hawthorne-fields",
    name: "Hawthorne Fields",
    city: "Paso Robles",
    state: "CA",
    county: "San Luis Obispo County",
    acreage: 64,
    plotCount: 24,
    status: "Phase I Release",
    verified: false,
    summary: "Ordered rows and long views, subdivided along the existing field pattern.",
    heroImage: {
      src: unsplash("1560493676-04071c5f467b"),
      alt: "Aerial view of cultivated fields arranged in precise parallel rows",
    },
    cardImage: {
      src: unsplash("1563514227147-6d2ff665a6a0", 1800),
      alt: "Planted rows running towards distant trees",
    },
  },
  {
    id: "juniper-ridge",
    name: "Juniper Ridge",
    city: "Weaverville",
    state: "NC",
    county: "Buncombe County",
    acreage: 86,
    plotCount: null,
    status: "Planning Review",
    verified: false,
    summary: "Forested ridgeline parcels reached by a single winding access road.",
    heroImage: {
      src: unsplash("1476231682828-37e571bc172f"),
      alt: "Aerial view of a road winding through dense forest",
    },
    cardImage: {
      src: unsplash("1542273917363-3b1817f69a2d", 1800),
      alt: "Mist settling over forested ridges",
    },
  },
  {
    id: "saddle-creek",
    name: "Saddle Creek Ranch",
    city: "Fredericksburg",
    state: "TX",
    county: "Gillespie County",
    acreage: 212,
    plotCount: 36,
    status: "Coming Soon",
    verified: false,
    summary: "Hill Country ranchland with long golden-hour shadows and open sky.",
    heroImage: {
      src: unsplash("1490682143684-14369e18dce8"),
      alt: "Open countryside at golden hour with low sun behind trees",
    },
    cardImage: {
      src: unsplash("1500964757637-c85e8a162699", 1800),
      alt: "Sunset light over rolling hills",
    },
  },
  {
    id: "aspen-hollow",
    name: "Aspen Hollow",
    city: "Driggs",
    state: "ID",
    county: "Teton County",
    acreage: null,
    plotCount: null,
    status: "Coming Soon",
    verified: false,
    summary: "Mountain-edge acreage beneath the Tetons. Details to follow.",
    heroImage: { src: unsplash("1511497584788-876760111969"), alt: "Pine trees beneath mountains" },
    cardImage: {
      src: unsplash("1511497584788-876760111969", 1800),
      alt: "Tall pines in front of a mountain range",
    },
  },
];

export interface HeroSlide {
  id: string;
  chapter: string;
  headline: string[];
  body: string;
  cta: { label: string; href: string };
  developmentId: Development["id"];
  /** CSS object-position, so each composition keeps its focal point. */
  focus: string;
  /** Shows the faint animated plot grid over the image. */
  plotOverlay?: boolean;
}

export const heroSlides: HeroSlide[] = [
  {
    id: "landscape",
    chapter: "The Expansive Landscape",
    headline: ["Land, With", "a Vision."],
    body: "Discover thoughtfully planned developments. Explore the land and find a place for what comes next.",
    cta: { label: "Explore the Development", href: "#developments" },
    developmentId: "willow-creek",
    focus: "50% 55%",
  },
  {
    id: "community",
    chapter: "The Planned Community",
    headline: ["Possibility", "Takes Shape."],
    body: "Explore individual plots within carefully planned developments.",
    cta: { label: "Discover Available Plots", href: "#plots" },
    developmentId: "hawthorne-fields",
    focus: "50% 50%",
    plotOverlay: true,
  },
  {
    id: "up-close",
    chapter: "The Land Up Close",
    headline: ["Find Your Piece", "of Land."],
    body: "Explore property details, understand the layout, and discover your next opportunity.",
    cta: { label: "Explore the Property", href: "#master-plan" },
    developmentId: "juniper-ridge",
    focus: "50% 50%",
  },
  {
    id: "bigger-picture",
    chapter: "The Bigger Picture",
    headline: ["See Beyond", "the Boundaries."],
    body: "Start with the landscape. Discover the plots within it.",
    cta: { label: "View All Developments", href: "#developments" },
    developmentId: "saddle-creek",
    focus: "50% 60%",
  },
];

export const getDevelopment = (id: string) => developments.find((d) => d.id === id)!;

export const images = {
  biggerPicture: {
    // 16:9 crop, mirrored so the forest sits right of frame; the overlay geometry depends on this exact framing
    src: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=2800&h=1575&flip=h&q=80",
    alt: "Aerial view where dense forest meets open water",
  },
  location: {
    src: unsplash("1500382017468-9049fed747ef", 2200),
    alt: "Open field at sunset with the sun low on the horizon",
  },
  finalCta: {
    src: unsplash("1470071459604-3b5ec3a7fe05", 2800),
    alt: "Sunlight breaking over a valley of layered hills",
  },
  planTexture: {
    src: unsplash("1473773508845-188df298d2d1", 1600),
    alt: "",
  },
};

export const formatAcres = (a: number | null) =>
  a == null ? "To be confirmed" : `${a.toLocaleString("en-US")} ac`;

export const formatPlots = (n: number | null) => (n == null ? "Pending verification" : `${n} plots`);

/** Plots featured in the showcase. Images are representative of the setting, not the specific lot. */
export const showcase = [
  {
    plotId: "p01",
    title: "The Tree-Line Homesite",
    image: { src: unsplash("1528183429752-a97d0bf99b5a", 2000), alt: "A single mature tree standing in an open meadow" },
  },
  {
    plotId: "p05",
    title: "Level Interior Lot",
    image: { src: unsplash("1469474968028-56623f02e42e", 1400), alt: "Morning mist drifting across a green valley" },
  },
  {
    plotId: "p08",
    title: "Open-Space Edge",
    image: { src: unsplash("1500534314209-a25ddb2bd429", 1400), alt: "Soft layered hills fading into haze" },
  },
];

/** Location panel — replace distances with verified figures before launch. */
export const surroundings = {
  developmentId: "willow-creek",
  intro:
    "Set within the rolling countryside of Williamson County, a short drive from historic downtown Franklin and the amenities of greater Nashville.",
  places: [
    { name: "Downtown Franklin", kind: "Town centre", distance: "~ 15 min" },
    { name: "Interstate 65", kind: "Major road", distance: "~ 10 min" },
    { name: "Nashville", kind: "City", distance: "~ 40 min" },
    { name: "BNA International Airport", kind: "Airport", distance: "~ 45 min" },
    { name: "Harpeth River access", kind: "Outdoors", distance: "~ 8 min" },
  ],
};
