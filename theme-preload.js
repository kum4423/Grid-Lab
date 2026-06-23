// FOUC対策: Reactのレンダリングを待たず、ストレージから読み込んだテーマを
// できるだけ早く <html> に反映する。失敗時はCSSの :root 既定値(red)にフォールバックする。
// MV3のデフォルトCSPはインラインスクリプトを許可しないため、外部ファイルとして読み込む。
"use strict";

(function () {
  try {
    chrome.storage.local.get(KeyPopupTheme, (data) => {
      if (chrome.runtime.lastError) {
        console.warn(chrome.runtime.lastError.message);
      }
      const themeId = (data && data[KeyPopupTheme]) || defaultSetting[KeyPopupTheme];
      document.documentElement.setAttribute("data-theme", themeId);
    });
  } catch (err) {
    console.warn(err);
  }
})();
