/**
 * 所有遊戲關卡使用的 localStorage key，集中在此維護。
 * useProgress 和重置邏輯都應引用此檔案，避免硬刻字串。
 */

/** 各章節完成標記 */
export const CHAPTER_COMPLETE_KEYS: Record<string, string> = {
  "chapter-1": "chapter1_complete",
  "chapter-2": "chapter2_complete",
  "chapter-3": "chapter3_complete",
  "chapter-4": "chapter4_complete",
};

/** 其餘遊戲過程中寫入的輔助 key */
export const GAME_AUXILIARY_KEYS = [
  "npc_after_done",
  "mw_dialog_done",
  "classifier_complete",
  "cls_after_done",
  "final_done",
  "lumi_dialog_done",
  "lumi_after_done",
  "chapter2_artwork",
  "tok_dialog_done",
  "tok_after_done",
  "ch4_mia_dialog",
  "ch4_mia_after",
] as const;

/** 重置時需要清除的所有 key */
export const ALL_GAME_KEYS = [
  ...Object.values(CHAPTER_COMPLETE_KEYS),
  ...GAME_AUXILIARY_KEYS,
];
