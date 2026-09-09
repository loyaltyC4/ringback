"use client";

import { useState } from "react";
import { Mark, STAGES, StepNav, type StageId } from "@/components/start/primitives";
import {
  StageBusiness,
  StageHear,
  StageLearn,
  StageLive,
  StageRehearsal,
} from "@/components/start/stages";
import { Interview } from "@/components/start/interview";
import "../start.css";

export default function Start() {
  const [i, setI] = useState(0);
  const [furthest, setFurthest] = useState(0);

  const go = (n: number) => {
    setI(n);
    setFurthest((f) => Math.max(f, n));
  };
  const next = () => go(Math.min(i + 1, STAGES.length - 1));
  const stage: StageId = STAGES[i].id;

  return (
    <div className="start">
      <header className="start-bar">
        <a className="start-brand" href="/">
          <Mark />
          RingBack
        </a>
        <StepNav active={stage} furthest={furthest} onJump={go} />
        <span className="start-site">kedronplumbing.com.au</span>
      </header>

      <main className="start-main" data-stage={stage}>
        {stage === "business" && <StageBusiness onNext={next} />}
        {stage === "learn" && <StageLearn onNext={next} />}
        {stage === "interview" && <Interview onDone={next} />}
        {stage === "hear" && <StageHear onNext={next} />}
        {stage === "rehearsal" && <StageRehearsal onNext={next} />}
        {stage === "live" && <StageLive />}
      </main>
    </div>
  );
}
