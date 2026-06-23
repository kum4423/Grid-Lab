"use strict";

const { useState, useEffect, useRef } = React;
const h = React.createElement;

// ---------- storage hook ----------
function useStorageState(key) {
  const [value, setValue] = useState(defaultSetting[key]);
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextWrite = useRef(true);

  useEffect(() => {
    let cancelled = false;
    getStorage(key).then((v) => {
      if (cancelled) return;
      setValue(v);
      setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (skipNextWrite.current) {
      // 初回ロード直後の書き込みはスキップ(ロードした値をそのまま書き戻さない)
      skipNextWrite.current = false;
      return;
    }
    if (!isLoaded) return;
    setStorage({ [key]: value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return [value, setValue, isLoaded];
}

// ---------- small UI atoms ----------
function Switch({ checked, onChange }) {
  return h(
    "label",
    { className: "switch" },
    h("input", {
      type: "checkbox",
      checked: !!checked,
      onChange: (e) => onChange(e.target.checked),
    }),
    h("span", { className: "switch-track" })
  );
}

function SwitchRow({ storageKey, label, description }) {
  const [value, setValue, isLoaded] = useStorageState(storageKey);
  if (!isLoaded) return null;
  return h(
    "div",
    { className: "row" },
    h(
      "div",
      { className: "row-switch", onClick: () => setValue(!value) },
      h(
        "div",
        { className: "row-switch-text" },
        h("span", { className: "row-label" }, label),
        description ? h("span", { className: "row-desc" }, description) : null
      ),
      h(Switch, {
        checked: value,
        onChange: (v) => setValue(v),
      })
    )
  );
}

function SliderRow({ storageKey, label, min, max, hint, onLiveChange }) {
  const [value, setValue, isLoaded] = useStorageState(storageKey);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (isLoaded && onLiveChange) onLiveChange(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, isLoaded]);

  if (!isLoaded) return null;

  return h(
    "div",
    { className: "row" },
    h(
      "div",
      { className: "row-slider-head" },
      h("span", { className: "row-label" }, label),
      h("span", { className: "row-value" }, draft)
    ),
    h("input", {
      type: "range",
      min,
      max,
      step: 1,
      value: draft,
      onChange: (e) => setDraft(Number(e.target.value)),
      onMouseUp: () => setValue(draft),
      onTouchEnd: () => setValue(draft),
      onKeyUp: () => setValue(draft),
    }),
    hint ? h("p", { className: "hint" }, hint) : null
  );
}

// ---------- live preview ----------
function Preview({ columns, label }) {
  const cols = Math.max(1, Math.min(columns || 1, 8));
  return h(
    "div",
    { className: "preview" },
    h("div", { className: "preview-label" }, label),
    h(
      "div",
      {
        className: "preview-grid",
        style: { gridTemplateColumns: `repeat(${cols}, 1fr)` },
      },
      Array.from({ length: cols }).map((_, i) =>
        h(
          "div",
          { className: "preview-card", key: i },
          h("div", { className: "preview-thumb" }),
          h(
            "div",
            { className: "preview-meta" },
            h("div", { className: "preview-line" }),
            h("div", { className: "preview-line short" })
          )
        )
      )
    )
  );
}

// ---------- theme picker ----------
function ThemeSwatch({ theme, selected, onSelect }) {
  return h(
    "button",
    {
      type: "button",
      className: "theme-swatch" + (selected ? " selected" : ""),
      "data-theme": theme.id,
      onClick: () => onSelect(theme.id),
      title: theme.label + (theme.mode === "light" ? "(ライト)" : "(ダーク)"),
    },
    h(
      "span",
      { className: "theme-swatch-preview" },
      h("span", { className: "theme-swatch-dot" }),
      h("span", { className: "theme-swatch-bar" })
    ),
    h("span", { className: "theme-swatch-label" }, theme.label),
    selected
      ? h("i", { className: "theme-swatch-check", "aria-hidden": "true" }, "✓")
      : null
  );
}

function ThemeTab({ theme, setTheme }) {
  return h(
    React.Fragment,
    null,
    h("div", { className: "section-title" }, "配色テーマ"),
    h(
      "div",
      { className: "theme-grid" },
      themeList.map((t) =>
        h(ThemeSwatch, {
          key: t.id,
          theme: t,
          selected: theme === t.id,
          onSelect: setTheme,
        })
      )
    ),
    h(
      "p",
      { className: "hint", style: { marginTop: "10px" } },
      "配色はこのポップアップの見た目だけを変更します。YouTube側の表示には影響しません。"
    )
  );
}

// ---------- tabs ----------
function HomeTab() {
  const [previewCols, setPreviewCols] = useState(defaultSetting[KeyVideoPerRow]);

  return h(
    React.Fragment,
    null,
    h(Preview, { columns: previewCols, label: "動画グリッドのプレビュー" }),

    h("div", { className: "section-title" }, "表示切り替え"),
    h(
      "div",
      { className: "panel" },
      h(SwitchRow, { storageKey: KeyHideShort, label: "ショート動画を非表示" }),
      h(SwitchRow, {
        storageKey: KeyHideChannelProfile,
        label: "チャンネルアイコンを非表示",
      }),
      h(SwitchRow, {
        storageKey: KeyDisplayFullTitle,
        label: "動画タイトルを全文表示",
        description: "2行で省略されるタイトルを折り返し表示します",
      }),
      h(SwitchRow, {
        storageKey: KeyDynamicVideo,
        label: "画面幅に応じて自動調整",
        description: "ウィンドウを縮めたとき列数を自動で減らします",
      })
    ),

    h("div", { className: "section-title" }, "列数"),
    h(
      "div",
      { className: "panel" },
      h(SliderRow, {
        storageKey: KeyVideoPerRow,
        label: "動画の列数",
        min: 1,
        max: 15,
        onLiveChange: setPreviewCols,
      }),
      h(SliderRow, {
        storageKey: KeyPostPerRow,
        label: "コミュニティ投稿の列数",
        min: 1,
        max: 6,
      }),
      h(SliderRow, {
        storageKey: KeyShelfItemPerRow,
        label: "ショート動画の列数",
        min: 1,
        max: 12,
        hint: "ホーム/登録チャンネルフィードに表示されるショート棚の列数です",
      })
    )
  );
}

function ChannelTab() {
  const [previewCols, setPreviewCols] = useState(
    defaultSetting[KeyChannelPageVideoPerRow]
  );

  return h(
    React.Fragment,
    null,
    h(Preview, { columns: previewCols, label: "チャンネルページのプレビュー" }),

    h("div", { className: "section-title" }, "表示切り替え"),
    h(
      "div",
      { className: "panel" },
      h(SwitchRow, {
        storageKey: KeyChannelPageWideLayout,
        label: "幅いっぱいに表示(ワイドレイアウト)",
      })
    ),

    h("div", { className: "section-title" }, "列数"),
    h(
      "div",
      { className: "panel" },
      h(SliderRow, {
        storageKey: KeyChannelPageVideoPerRow,
        label: "動画の列数",
        min: 1,
        max: 15,
        onLiveChange: setPreviewCols,
      }),
      h(SliderRow, {
        storageKey: KeyChannelPageShelfItemPerRow,
        label: "ショート動画の列数",
        min: 1,
        max: 15,
      })
    )
  );
}

// ---------- root ----------
function App() {
  const [tab, setTab] = useState("home");
  const [enabled, setEnabled, isLoaded] = useStorageState(KeyExtensionStatus);
  const [theme, setTheme, themeLoaded] = useStorageState(KeyPopupTheme);

  useEffect(() => {
    if (!themeLoaded) return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, themeLoaded]);

  if (!isLoaded || !themeLoaded) return null;

  return h(
    React.Fragment,
    null,
    h(
      "div",
      { className: "header" },
      h(
        "div",
        { className: "brand" },
        h(
          "div",
          { className: "brand-mark" },
          h("span"),
          h("span"),
          h("span"),
          h("span"),
          h("span"),
          h("span"),
          h("span"),
          h("span"),
          h("span")
        ),
        h(
          "div",
          { className: "brand-title" },
          "Grid Lab",
          h("small", null, "YouTube layout tweaks")
        )
      ),
      h(
        "div",
        { className: "master-toggle" },
        h("span", { className: "master-toggle-label" }, enabled ? "ON" : "OFF"),
        h(Switch, { checked: enabled, onChange: setEnabled })
      )
    ),

    h(
      "div",
      { className: "tabs" },
      h(
        "button",
        {
          className: "tab-btn" + (tab === "home" ? " active" : ""),
          onClick: () => setTab("home"),
        },
        "ホームページ"
      ),
      h(
        "button",
        {
          className: "tab-btn" + (tab === "channel" ? " active" : ""),
          onClick: () => setTab("channel"),
        },
        "チャンネルページ"
      ),
      h(
        "button",
        {
          className: "tab-btn" + (tab === "settings" ? " active" : ""),
          onClick: () => setTab("settings"),
        },
        "設定"
      )
    ),

    h(
      "main",
      { className: tab !== "settings" && !enabled ? "disabled" : "" },
      tab === "home"
        ? h(HomeTab)
        : tab === "channel"
        ? h(ChannelTab)
        : h(ThemeTab, { theme, setTheme })
    ),

    h(
      "footer",
      null,
      h(
        "a",
        {
          href: "https://github.com/sapondanaisriwan/youtube-row-fixer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        "元プロジェクト"
      ),
      h(
        "a",
        {
          href: "https://addons.mozilla.org/firefox/",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        "評価する"
      )
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(h(App));
