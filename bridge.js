// ISOLATED world で実行されるスクリプト。
// chrome.storage.onChanged を購読できるのはこちら側のみなので、
// 設定が変わるたびに MAIN world (inject_main.js) へ CustomEvent で値を渡す。
"use strict";

(() => {
  const port = {
    listen(name, callback) {
      window.addEventListener(name, callback);
    },
    callEvent({ name, detail }) {
      const customEvent = new CustomEvent(name, {
        detail: JSON.stringify({ data: detail }),
      });
      window.dispatchEvent(customEvent);
    },
  };

  const getAllStorageLocal = (keysArray) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(keysArray, (data) => {
        if (chrome.runtime.lastError) {
          console.warn(chrome.runtime.lastError.message);
        }
        const mergedSetting = keysArray.reduce((result, key) => {
          result[key] = data[key] ?? defaultSetting[key];
          return result;
        }, {});
        resolve(mergedSetting);
      });
    });
  };

  chrome.storage.onChanged.addListener(async () => {
    const allData = await getAllStorageLocal(settingKey);
    port.callEvent({ name: eventSendRowFixerData, detail: allData });
  });

  port.listen(eventGetRowFixerData, async () => {
    const allData = await getAllStorageLocal(settingKey);
    port.callEvent({ name: eventSendRowFixerData, detail: allData });
  });
})();
