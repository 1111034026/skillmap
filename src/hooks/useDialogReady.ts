import { useState, useEffect, useRef } from "react";
import type { RefObject } from "react";

const TIMER_ONLY_MS = 1500;   // no audio: original behaviour
const MIN_WITH_AUDIO_MS = 300; // with audio: short guard, then wait for audio end

/**
 * 對話框節奏鎖。
 *
 * @param key      每次出現新對話行時必須改變
 * @param active   對話框不可見時傳 false，跳過計時器
 * @param audioRef 傳入音效 ref 時，同時等配音播完才 ready
 */
export function useDialogReady(
  key: string | number,
  active = true,
  audioRef?: RefObject<HTMLAudioElement | null>,
) {
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    readyRef.current = false;
    setReady(false);
    if (!active) return;

    if (!audioRef) {
      // 沒有音效：原本的計時器行為
      const t = setTimeout(() => {
        readyRef.current = true;
        setReady(true);
      }, TIMER_ONLY_MS);
      return () => clearTimeout(t);
    }

    // 有音效：MIN_WITH_AUDIO_MS 最短等待 + 等配音播完
    let disposed = false;
    let minDone = false;
    let audioDone = false;

    const tryReady = () => {
      if (!disposed && minDone && audioDone) {
        readyRef.current = true;
        setReady(true);
      }
    };

    const t = setTimeout(() => { minDone = true; tryReady(); }, MIN_WITH_AUDIO_MS);

    // 用 microtask 讓 playVoice 的 useEffect 先跑完，再讀 audioRef.current
    Promise.resolve().then(() => {
      if (disposed) return;
      const audio = audioRef.current;
      if (!audio || audio.ended || audio.paused) {
        audioDone = true;
        tryReady();
      } else {
        const onDone = () => { audioDone = true; tryReady(); };
        audio.addEventListener("ended", onDone, { once: true });
        audio.addEventListener("error", onDone, { once: true });
      }
    });

    return () => { disposed = true; clearTimeout(t); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active]);

  return { ready, readyRef };
}
