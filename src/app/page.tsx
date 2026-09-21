import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import WhyAC from "@/components/marketing/WhyAC";
import FamilyNetwork from "@/components/marketing/FamilyNetwork";
import Tokenomics from "@/components/marketing/Tokenomics";
import HowToBuy from "@/components/marketing/HowToBuy";
import ReferralTeaser from "@/components/marketing/ReferralTeaser";
import PresaleInfo from "@/components/marketing/PresaleInfo";
import FAQ from "@/components/marketing/FAQ";
import Footer from "@/components/marketing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WhyAC />
        <FamilyNetwork />
        <Tokenomics />
        <HowToBuy />
        <ReferralTeaser />
        <PresaleInfo />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
