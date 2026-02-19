import Features from "../components/Features";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Navbar from "../components/Navbar";
import SecuritySection from "../components/SecuritySection";

export default function Homepage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <SecuritySection />
      <Footer />
    </>
  );
}
