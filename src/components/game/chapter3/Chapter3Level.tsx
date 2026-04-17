"use client";
import { navigate } from "@/lib/navigate";

import { useState } from "react";
import Screen2Task1 from "./Screen2Task1";
import Screen5Complete from "./Screen5Complete";

export default function Chapter3Level() {
  const [done, setDone] = useState(false);

  if (done) {
    return <Screen5Complete onDone={() => navigate("/level/chapter-3")} />;
  }

  return <Screen2Task1 onDone={() => setDone(true)} />;
}
