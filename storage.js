// chrome.storage.local への薄いラッパー
// Firefoxの実装でも chrome.* 名前空間がエイリアスとして使えるため
// browser.* に書き換える必要はない(WebExtension Promise APIにも両対応)
"use strict";

const getStorage = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (data) => {
      if (chrome.runtime.lastError) {
        console.warn(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
        return;
      }
      resolve(data[key] ?? defaultSetting[key]);
    });
  });
};

const getAllStorage = (keysArray) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keysArray, (data) => {
      if (chrome.runtime.lastError) {
        console.warn(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
        return;
      }
      const mergedSetting = keysArray.reduce((result, key) => {
        result[key] = data[key] ?? defaultSetting[key];
        return result;
      }, {});
      resolve(mergedSetting);
    });
  });
};

const setStorage = (kv) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(kv, () => {
      if (chrome.runtime.lastError) {
        console.warn(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
        return;
      }
      resolve(kv);
    });
  });
};
