"use client";

import { Hero } from "@/components/hero";
import { StageRail } from "@/components/stage-rail";
import {
  Bento,
  Faq,
  FinalCta,
  FollowUpTabs,
  Pricing,
  Proof,
  Security,
  StatSplit,
} from "@/components/sections";
import { Footer, IntegrationStrip, Nav, useReveals } from "@/components/site-chrome";

export default function Home() {
  useReveals();

  return (
    <>
      <Nav />
      {/* the fold: hero fills the viewport, brand strip pinned to its bottom
          edge, so the dark section only appears once you scroll */}
      <div className="fold">
        <Hero />
        <IntegrationStrip />
      </div>
      <StageRail />
      <StatSplit />
      <Bento />
      <FollowUpTabs />
      <Proof />
      <Security />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  );
}
