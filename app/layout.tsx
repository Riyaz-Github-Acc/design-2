import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ["400", "500", "600"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Fieldline Land Co. — Land, With a Vision",
  description:
    "Thoughtfully planned land developments across the United States. Explore developments, discover individual plots, and find your piece of land.",
};

export const viewport: Viewport = { themeColor: "#111714" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
