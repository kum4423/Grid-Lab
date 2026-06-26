// 拡張機能全体で使うストレージキーとデフォルト値の定義
"use strict";

const KeyExtensionStatus = "extensionStatus";

// ポップアップの配色テーマ(YouTube側のレイアウトには影響しない、popup.js専用の設定)
const KeyPopupTheme = "popupTheme";

const themeList = [
  { id: "red",         label: "YouTube Red",    mode: "dark"  },
  { id: "red-light",   label: "YouTube Red",    mode: "light" },
  { id: "blue",        label: "Ocean Blue",     mode: "dark"  },
  { id: "green",       label: "Forest Green",   mode: "dark"  },
  { id: "purple",      label: "Grape Purple",   mode: "dark"  },
  { id: "amber",       label: "Sunset Amber",   mode: "dark"  },
  { id: "teal",        label: "Teal",           mode: "dark"  },
  { id: "sepia",       label: "Sepia",          mode: "light" },
  // 方向性A: 色相を埋める
  { id: "rose",        label: "Rose Pink",      mode: "dark"  },
  { id: "slate",       label: "Slate",          mode: "dark"  },
  { id: "nord",        label: "Nord",           mode: "dark"  },
  { id: "crimson",     label: "Crimson",        mode: "dark"  },
  // 方向性B: 雰囲気・コンセプト
  { id: "oled",        label: "OLED Black",     mode: "dark"  },
  { id: "catppuccin",  label: "Catppuccin",     mode: "dark"  },
  { id: "dracula",     label: "Dracula",        mode: "dark"  },
  { id: "solarized",   label: "Solarized Dark", mode: "dark"  },
  // 方向性C: ライト系
  { id: "white",       label: "Pure White",     mode: "light" },
  { id: "mint",        label: "Mint Light",     mode: "light" },
  { id: "lavender",    label: "Lavender Light", mode: "light" },
  { id: "sky",         label: "Sky Light",      mode: "light" },
];

// Home page
const KeyHideChannelProfile = "hideChannelProfile";
const KeyHideShort = "hideShort";
const KeyDisplayFullTitle = "displayFullTitle";
const KeyDynamicVideo = "dynamicVideoPerRow";
const KeyVideoPerRow = "videoPerRow";
const KeyPostPerRow = "postPerRow";
const KeyShelfItemPerRow = "shelfItemPerRow";

// Channel page
const KeyChannelPageVideoPerRow = "channelPageVideoPerRow";
const KeyChannelPageShelfItemPerRow = "channelPageShelfItemPerRow";
const KeyChannelPageWideLayout = "channelPageWideLayout";

const settingKey = [
  KeyExtensionStatus,

  KeyDynamicVideo,
  KeyHideChannelProfile,
  KeyHideShort,
  KeyDisplayFullTitle,
  KeyVideoPerRow,
  KeyPostPerRow,
  KeyShelfItemPerRow,

  KeyChannelPageVideoPerRow,
  KeyChannelPageShelfItemPerRow,
  KeyChannelPageWideLayout,
];

const defaultSetting = {
  [KeyExtensionStatus]: true,
  [KeyPopupTheme]: "red",

  [KeyDynamicVideo]: false,
  [KeyHideChannelProfile]: true,
  [KeyHideShort]: false,
  [KeyDisplayFullTitle]: false,
  [KeyVideoPerRow]: 5,
  [KeyPostPerRow]: 3,
  [KeyShelfItemPerRow]: 12,

  [KeyChannelPageWideLayout]: false,
  [KeyChannelPageVideoPerRow]: 5,
  [KeyChannelPageShelfItemPerRow]: 8,
};
