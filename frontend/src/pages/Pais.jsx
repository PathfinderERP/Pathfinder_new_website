import React, { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';

// Sub-components
import Ribbon from '../components/pais/Ribbon';
import HeroSection from '../components/pais/HeroSection';
import WhyStudentsNeed from '../components/pais/WhyStudentsNeed';
import WhatYouGet from '../components/pais/WhatYouGet';
import HowItHelps from '../components/pais/HowItHelps';
import WhoItIsFor from '../components/pais/WhoItIsFor';
import PricingSection from '../components/pais/PricingSection';
import ComparisonSection from '../components/pais/ComparisonSection';
import Testimonials from '../components/pais/Testimonials';
import FAQ from '../components/pais/FAQ';
import EnquiryForm from '../components/pais/EnquiryForm';
import FinalCall from '../components/pais/FinalCall';

const Pais = () => {
  const [selectedPackage, setSelectedPackage] = React.useState("");

  useEffect(() => {
    // Set page title
    document.title = "PAIS | Pathfinder Academy";
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout showHeader={false} showFooter={false}>
      {/* Sticky Countdown Ribbon */}
      <Ribbon />

      <div className="min-h-screen bg-[#050B14] text-white selection:bg-[#00BCFF]/30 font-sans overflow-x-hidden">
        
        {/* Atmospheric Ambient Lighting Props */}
        <div className="absolute top-0 left-0 w-full h-screen pointer-events-none overflow-hidden -z-0">
          <div className="absolute top-[-2%] left-[-2%] w-[200px] h-[200px] bg-[#00BCFF]/10 rounded-full blur-[60px]" />
          <div className="absolute top-[-2%] right-[-1%] w-[180px] h-[180px] bg-indigo-600/10 rounded-full blur-[50px]" />
        </div>

        {/* Modular Page Sections with Alternating Backgrounds & Dividers */}
        <div className="bg-[#050B14]">
          <HeroSection />
        </div>
        
        <div className="border-t border-white/10 w-full" />
        
        <div className="bg-[#0A111E]">
          <WhyStudentsNeed />
        </div>

        <div className="border-t border-white/10 w-full" />

        <div className="bg-[#050B14]">
          <WhatYouGet />
        </div>

        <div className="border-t border-white/10 w-full" />

        <div className="bg-[#0A111E]">
          <HowItHelps />
        </div>

        <div className="border-t border-white/10 w-full" />

        <div className="bg-[#050B14]">
          <WhoItIsFor />
        </div>

        <div className="border-t border-white/10 w-full" />

        <div className="bg-[#0A111E]">
          <PricingSection onSelectPackage={(id) => {
            setSelectedPackage(id);
            document.getElementById('enquiry-section')?.scrollIntoView({ behavior: 'smooth' });
          }} />
        </div>

        <div className="border-t border-white/10 w-full" />

        <div className="bg-[#050B14]">
          <ComparisonSection />
        </div>

        <div className="border-t border-white/10 w-full" />

        <div className="bg-[#0A111E]">
          <Testimonials />
        </div>

        <div className="border-t border-white/10 w-full" />

        <div className="bg-[#050B14]">
          <FAQ />
        </div>

        <div className="border-t border-white/10 w-full" />

        <div className="bg-[#0A111E]">
          <EnquiryForm selectedPackage={selectedPackage} setSelectedPackage={setSelectedPackage} />
        </div>

        <div className="border-t border-white/10 w-full" />

        <div className="bg-[#050B14]">
          <FinalCall />
        </div>
        
      </div>
    </MainLayout>
  );
};

export default Pais;
