"use client";

import { useState } from "react";
import { QUESTIONS } from "@/data/chapter1";
import Screen1Mission from "./Screen1Mission";
import Screen2Tutorial from "./Screen2Tutorial";
import Screen3Game from "./Screen3Game";
import Screen4Correct from "./Screen4Correct";
import Screen5Wrong from "./Screen5Wrong";
import Screen6Complete from "./Screen6Complete";

type Screen = "mission" | "tutorial" | "game" | "correct" | "wrong" | "complete";

export default function Chapter1Level() {
  const [screen, setScreen] = useState<Screen>("game");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctMsg, setCorrectMsg] = useState("");
  const [wrongMsg, setWrongMsg] = useState("");
  const [wrongHints, setWrongHints] = useState<string[]>([]);

  const total = QUESTIONS.length;
  const isLast = questionIndex === total - 1;

  const handleCorrect = () => {
    setCorrectMsg(QUESTIONS[questionIndex].correctMsg);
    setScreen("correct");
  };

  const handleWrong = (hints: string[]) => {
    setWrongMsg(QUESTIONS[questionIndex].wrongMsg);
    setWrongHints(hints);
    setScreen("wrong");
  };

  const handleNext = () => {
    if (isLast) {
      setScreen("complete");
    } else {
      setQuestionIndex((i) => i + 1);
      setScreen("game");
    }
  };

  const handleRetry = () => setScreen("game");

  return (
    <>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes flash {
          0%,100% { filter: brightness(1); }
          50% { filter: brightness(2) saturate(0.3); }
        }
      `}</style>

      {screen === "mission"  && <Screen1Mission onStart={() => setScreen("tutorial")} />}
      {screen === "tutorial" && <Screen2Tutorial onDone={() => setScreen("game")} />}
      {screen === "game"     && (
        <Screen3Game
          key={questionIndex}
          question={QUESTIONS[questionIndex]}
          questionIndex={questionIndex}
          total={total}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />
      )}
      {screen === "correct"  && <Screen4Correct message={correctMsg} onNext={handleNext} isLast={isLast} />}
      {screen === "wrong"    && <Screen5Wrong message={wrongMsg} hints={wrongHints} onRetry={handleRetry} />}
      {screen === "complete" && <Screen6Complete total={total} />}
    </>
  );
}
