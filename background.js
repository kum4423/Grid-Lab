// background script
// chrome.scripting.registerContentScripts を使い、YouTubeページに
// 2本のスクリプトを動的注入する。
//  - bridge.js     : ISOLATED world  (拡張機能のstorage APIにアクセス可能)
//  - inject_main.js: MAIN world      (YouTubeページ自身のJSスコープにアクセス可能、ytZara.js込み)
// 2つはCustomEvent経由で通信する(bridge.js参照)。
"use strict";

importScripts("storage-key.js", "data.js", "storage.js");

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
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

const getRegisteredScripts = async () => {
  try {
    const matchingScripts = await chrome.scripting.getRegisteredContentScripts({
      ids: allScriptIds,
    });
    return matchingScripts.length > 0;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const injectScript = async ({ id, runAt, world, files }) => {
  try {
    await chrome.scripting.registerContentScripts([
      {
        id,
        runAt: runAt ?? "document_start",
        world: world ?? "ISOLATED",
        matches: ["*://*.youtube.com/*"],
        js: files,
      },
    ]);
  } catch (err) {
    console.warn(err);
  }
};

const unregisterScripts = async (ids) => {
  try {
    await chrome.scripting.unregisterContentScripts({ ids });
  } catch (err) {
    console.warn(err);
  }
};

const registerAll = async () => {
  try {
    const alreadyRegistered = await getRegisteredScripts();
    if (alreadyRegistered) {
      return;
    }

    await injectScript({
      id: scriptContentScript,
      world: "ISOLATED",
      files: ["storage-key.js", "bridge.js"],
    });
    await injectScript({
      id: scriptInjectScript,
      world: "MAIN",
      files: ["data.js", "inject/lib/ytZara.js", "inject/inject_main.js"],
    });
  } catch (err) {
    console.warn(err);
  }
};

chrome.storage.onChanged.addListener(async (changes) => {
  try {
    if (!changes[KeyExtensionStatus]) {
      return;
    }

    const extensionStatus = await getStorage(KeyExtensionStatus);

    if (extensionStatus) {
      await registerAll();
      return;
    }

    const alreadyRegistered = await getRegisteredScripts();
    if (alreadyRegistered) {
      await unregisterScripts(allScriptIds);
    }
  } catch (err) {
    console.warn(err);
  }
});

// 拡張機能起動時(ブラウザ起動、拡張機能更新時など)に毎回実行
registerAll();
