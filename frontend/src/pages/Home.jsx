import React from "react";

import Hero from "../components/Hero";
import FeaturesSection from "../components/FeaturesSection";
import WhoIsItFor from "../components/WhoIsItFor";
import PricingSection from "../components/PricingSection";


export default function Home() {
  const handleStart = () => {
    window.location.href = "https://app.infrascribe.dev";
  };

  return (
    <div className="app-root">
      <Hero onStart={handleStart} />

      
      <FeaturesSection />
      <WhoIsItFor />
      <PricingSection />
    </div>
  );
}
