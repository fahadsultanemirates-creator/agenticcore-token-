import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import ClaimGiftSection from "@/components/marketing/ClaimGiftSection";
import WhyAC from "@/components/marketing/WhyAC";
import Team from "@/components/marketing/Team";
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
        <ClaimGiftSection />
        <WhyAC />
        <FamilyNetwork />
        <Team />
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
