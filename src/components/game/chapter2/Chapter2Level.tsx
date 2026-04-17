"use client";

import { useState } from "react";
import { C2Theme, C2Element, StageResult } from "@/data/chapter2";
import Screen1Theme from "./Screen1Theme";
import Screen2Elements from "./Screen2Elements";
import Screen3Stage from "./Screen3Stage";
import Screen4Complete from "./Screen4Complete";

type Screen = "theme" | "bg" | "ch" | "prop" | "stage" | "complete";

export default function Chapter2Level() {
  const [screen,    setScreen]   = useState<Screen>("theme");
  const [theme,     setTheme]    = useState<C2Theme | null>(null);
  const [selBg,     setSelBg]    = useState<C2Element | null>(null);
  const [selCh,     setSelCh]    = useState<C2Element | null>(null);
  const [selProp,   setSelProp]  = useState<C2Element | null>(null);
  const [stageResult, setStageResult] = useState<StageResult | null>(null);

  return (
    <>
      {screen === "theme" && (
        <Screen1Theme onSelect={(t) => { setTheme(t); setScreen("bg"); }} />
      )}

      {screen === "bg" && theme && (
        <Screen2Elements key="bg" theme={theme} elementType="background" showTaskIntro={true} isLastRound={false}
          onDone={(el) => { setSelBg(el); setScreen("ch"); }} />
      )}

      {screen === "ch" && theme && (
        <Screen2Elements key="ch" theme={theme} elementType="character" showTaskIntro={false} isLastRound={false}
          onDone={(el) => { setSelCh(el); setScreen("prop"); }} />
      )}

      {screen === "prop" && theme && (
        <Screen2Elements key="prop" theme={theme} elementType="prop" showTaskIntro={false} isLastRound={true}
          onDone={(el) => { setSelProp(el); setScreen("stage"); }} />
      )}

      {screen === "stage" && theme && selBg && selCh && selProp && (
        <Screen3Stage
          theme={theme}
          background={selBg}
          character={selCh}
          prop={selProp}
          onDone={(result) => { setStageResult(result); setScreen("complete"); }}
        />
      )}

      {screen === "complete" && theme && selBg && selCh && selProp && stageResult && (
        <Screen4Complete
          theme={theme}
          background={selBg}
          character={selCh}
          prop={selProp}
          stageResult={stageResult}
        />
      )}
    </>
  );
}
