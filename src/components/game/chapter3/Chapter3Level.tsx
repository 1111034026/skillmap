"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Screen2Task1 from "./Screen2Task1";
import Screen5Complete from "./Screen5Complete";

export default function Chapter3Level() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  if (done) {
    return <Screen5Complete onDone={() => router.push("/level/chapter-3")} />;
  }

  return <Screen2Task1 onDone={() => setDone(true)} />;
}
