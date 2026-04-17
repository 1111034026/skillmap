"use client";
import { navigate } from "@/lib/navigate";

import { useState } from "react";
import Screen2Task1 from "./Screen2Task1";
import Screen3Test1 from "./Screen3Test1";
import Screen4Task2 from "./Screen4Task2";
import Screen5Test2 from "./Screen5Test2";

type Screen = "task1" | "test1" | "task2" | "test2";

export default function Chapter4Level() {
  const [screen, setScreen] = useState<Screen>("task1");

  const handleComplete = () => {
    try { localStorage.setItem("chapter4_complete", "1"); } catch { /* ignore */ }
    navigate("/level/chapter-4");
  };

  return (
    <>
      {screen === "task1" && <Screen2Task1 onDone={() => setScreen("test1")} />}
      {screen === "test1" && <Screen3Test1 onDone={() => setScreen("task2")} />}
      {screen === "task2" && <Screen4Task2 onDone={() => setScreen("test2")} />}
      {screen === "test2" && <Screen5Test2 onDone={handleComplete} />}
    </>
  );
}
