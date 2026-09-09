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
  StatSplit,
} from "@/components/sections";
import { Footer, IntegrationStrip, Nav, useReveals } from "@/components/site-chrome";

export default function Home() {
  useReveals();

  return (
    <>
      <Nav />
      <Hero />
      <IntegrationStrip />
      <StageRail />
      <StatSplit />
      <Bento />
      <FollowUpTabs />
      <Proof />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  );
}
