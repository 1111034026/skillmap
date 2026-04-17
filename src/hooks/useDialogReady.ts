import { useState, useEffect, useRef } from "react";

const LOCK_MS = 1500;

/**
 * 對話框節奏鎖：每出現一行新對話就鎖 LOCK_MS ms，鎖定期間無法進下一句。
 *
 * @param key    每次出現新對話行時必須改變（例如 dialogIndex，或 `${dialog}-${idx}`）
 * @param active 對話框不可見時傳 false，跳過計時器
 */
export function useDialogReady(key: string | number, active = true) {
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    readyRef.current = false;
    setReady(false);
    if (!active) return;
    const t = setTimeout(() => {
      readyRef.current = true;
      setReady(true);
    }, LOCK_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active]);

  return { ready, readyRef };
}
