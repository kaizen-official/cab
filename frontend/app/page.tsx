import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Features from "./components/features";
import RidePreview from "./components/ride-preview";
import HowItWorks from "./components/how-it-works";
import CTA from "./components/cta";
import Footer from "./components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary noise">
      <Navbar />
      <main className="relative z-1">
        <Hero />
        <Features />
        <RidePreview />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
