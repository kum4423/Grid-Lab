// background script
// 旧バージョンで登録した MAIN/ISOLATED world の動的 content script を解除する。
// 列数制御は manifest.json の静的 content_script.js に統一した。
"use strict";

const allScriptIds = ["content_script_bridge", "inject_script_main"];

const unregisterLegacyScripts = async () => {
  try {
    const registeredScripts = await chrome.scripting.getRegisteredContentScripts({
      ids: allScriptIds,
    });
    if (registeredScripts.length) {
      await chrome.scripting.unregisterContentScripts({ ids: allScriptIds });
    }
  } catch (err) {
    console.warn(err);
  }
};

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await unregisterLegacyScripts();

  if (reason === "install") {
    try {
      await chrome.tabs.create({
        url: "https://github.com/sapondanaisriwan/youtube-row-fixer",
      });
    } catch (err) {
      console.warn(err);
    }
  }
});

if (chrome.runtime.onStartup) {
  chrome.runtime.onStartup.addListener(unregisterLegacyScripts);
}

unregisterLegacyScripts();
