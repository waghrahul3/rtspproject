import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import HowItWorks from "@/components/site/HowItWorks";
import CloudSection from "@/components/site/CloudSection";
import Benefits from "@/components/site/Benefits";
import SetupSection from "@/components/site/SetupSection";
import Pricing from "@/components/site/Pricing";
import EmbedApiSection from "@/components/site/EmbedApiSection";
import FaqProducts from "@/components/site/FaqProducts";
import { Contact, Footer } from "@/components/site/ContactFooter";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <Navbar />
      <main>
        <Hero />
        <div className="relative">
          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(900px,80%)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <HowItWorks />
          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(900px,80%)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <CloudSection />
          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(900px,80%)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <Benefits />
          <SetupSection />
        </div>
        <Pricing />
        <EmbedApiSection />
        <FaqProducts />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
