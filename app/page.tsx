import BiggerPicture from "@/components/BiggerPicture";
import DevelopmentsCarousel from "@/components/DevelopmentsCarousel";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import Location from "@/components/Location";
import MasterPlan from "@/components/MasterPlan";
import Planning from "@/components/Planning";
import PlotShowcase from "@/components/PlotShowcase";
import { PlotProvider } from "@/lib/plot-context";

export default function Home() {
  return (
    <PlotProvider>
      <Header />
      <main>
        <HeroCarousel />
        <DevelopmentsCarousel />
        <MasterPlan />
        <BiggerPicture />
        <PlotShowcase />
        <Location />
        <Planning />
        <FinalCta />
      </main>
      <Footer />
    </PlotProvider>
  );
}
