import type { CSSProperties } from "react";

export const BOARD_BACKGROUNDS = {
  aurora: {
    label: "Aurora",
    swatch: "linear-gradient(135deg, #b9e7e4, #83b6d8 52%, #9b9bd3)",
    style: {
      backgroundColor: "#a9d3d9",
      backgroundImage:
        "radial-gradient(ellipse at 12% 5%, rgba(255,255,255,.68), transparent 36%), radial-gradient(ellipse at 88% 10%, rgba(171,193,255,.52), transparent 34%), linear-gradient(145deg, #c5e8e0 0%, #a6d5dc 45%, #b7b8df 100%)",
    },
  },
  coast: {
    label: "Coast",
    swatch: "linear-gradient(135deg, #c4e7e7, #76b6d3 55%, #f0d8b0)",
    style: {
      backgroundColor: "#9ccbd2",
      backgroundImage:
        "radial-gradient(ellipse at 80% 8%, rgba(255,244,211,.72), transparent 29%), linear-gradient(170deg, rgba(255,255,255,.32) 0%, transparent 38%), linear-gradient(160deg, #c7e7e2 0%, #8fc9d5 48%, #b6d8cf 72%, #e9d8b9 100%)",
    },
  },
  meadow: {
    label: "Meadow",
    swatch: "linear-gradient(135deg, #d8edcc, #9bc7a8 55%, #d7dbad)",
    style: {
      backgroundColor: "#bbd4b4",
      backgroundImage:
        "radial-gradient(ellipse at 15% 12%, rgba(255,255,255,.65), transparent 32%), radial-gradient(ellipse at 88% 25%, rgba(238,239,190,.54), transparent 35%), linear-gradient(155deg, #d9ebcf 0%, #bad9bb 48%, #d8dcb4 100%)",
    },
  },
  dusk: {
    label: "Dusk",
    swatch: "linear-gradient(135deg, #f2c7bb, #c4a8c9 55%, #829abe)",
    style: {
      backgroundColor: "#c3a6bd",
      backgroundImage:
        "radial-gradient(ellipse at 84% 8%, rgba(255,226,190,.66), transparent 31%), linear-gradient(160deg, rgba(255,255,255,.25), transparent 42%), linear-gradient(145deg, #f0c9bb 0%, #d8b3c3 48%, #9eaccb 100%)",
    },
  },
} satisfies Record<string, { label: string; swatch: string; style: CSSProperties }>;

export type BoardBackgroundPreset = keyof typeof BOARD_BACKGROUNDS;

export const DEFAULT_BOARD_BACKGROUND: BoardBackgroundPreset = "aurora";

const getPreferenceKey = (boardId: string) => `nexora:board-background:${boardId}`;

export const getBoardBackgroundPreference = (boardId: string): BoardBackgroundPreset => {
  const savedPreset = window.localStorage.getItem(getPreferenceKey(boardId));
  return savedPreset && savedPreset in BOARD_BACKGROUNDS
    ? (savedPreset as BoardBackgroundPreset)
    : DEFAULT_BOARD_BACKGROUND;
};

export const saveBoardBackgroundPreference = (
  boardId: string,
  preset: BoardBackgroundPreset,
): void => {
  window.localStorage.setItem(getPreferenceKey(boardId), preset);
};
