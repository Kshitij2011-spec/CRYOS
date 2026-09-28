import { useEffect } from 'react';
import { LandingNavbar } from './components/LandingNavbar';
import { LandingHero } from './components/LandingHero';
import { HowCryosThinksSection } from './components/HowCryosThinksSection';
import { CapabilitiesSection } from './components/CapabilitiesSection';
import { LandingProductPreview } from './components/LandingProductPreview';
import { LandingCtaSection } from './components/LandingCtaSection';
import { LandingFooter } from './components/LandingFooter';

export function LandingPage() {
  // Set document title
  useEffect(() => {
    document.title = 'CRYOS — Antarctic Polar Expedition Operations Platform';
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-foreground selection:bg-accent/20 selection:text-accent font-sans">
      {/* 01 — Sticky Navigation (Clean links, no fake dropdowns) */}
      <LandingNavbar />

      <main id="main-content">
        {/* 02 — Hero Section (Strong Antarctic visual, no fake KPI tickers) */}
        <LandingHero />

        {/* 03 — Core Workflow (From event to decision: 6 sequential stages) */}
        <HowCryosThinksSection />

        {/* 04 — Operational Capabilities (Mapped to real existing routes) */}
        <CapabilitiesSection />

        {/* 05 — Product Preview (Real Control Tower data from local SQLite pipeline) */}
        <LandingProductPreview />

        {/* 06 — Final Action CTA */}
        <LandingCtaSection />
      </main>

      {/* 07 — Minimal Footer */}
      <LandingFooter />
    </div>
  );
}
