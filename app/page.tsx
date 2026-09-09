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
      <Hero />
      <IntegrationStrip />
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
