// manifest.json の content_scripts で document_start に静的注入されるスクリプト。
// グリッドのCSSカスタムプロパティ自体は inject/inject_main.js (MAIN world)側が
// 書き換えるが、それ以外の表示オプション(ショート非表示、タイトル全文表示、
// 投稿/ショートの実セル幅、チャンネルページの幅広レイアウトなど)はここで
// <style> タグを注入することで実現する。
"use strict";

const removeElementById = (id) => {
  const element = document.getElementById(id);
  element && element.remove();
};

const addStyle = (id, css) => {
  removeElementById(id);
  const style = document.createElement("style");
  style.id = id;
  style.className = "RFYT";
  style.textContent = css;

  if (document.head) {
    document.head.append(style);
  }
  document.documentElement.append(style);
};

// ---- Hide channel profile (avatar) ----
const optionHideChannelProfile = (hideChannelProfile) => {
  if (!hideChannelProfile) {
    removeElementById(KeyHideChannelProfile);
    return;
  }
  addStyle(
    KeyHideChannelProfile,
    `
    .channel-avatar.ytd-ghost-grid-renderer,
    #home-page-skeleton .channel-avatar {
        display: none !important;
    }
    .ytLockupMetadataViewModelStandard .ytLockupMetadataViewModelAvatar,
    .yt-lockup-metadata-view-model--standard .yt-lockup-metadata-view-model__avatar,
    .yt-lockup-metadata-view-model-wiz--standard .yt-lockup-metadata-view-model-wiz__avatar,
    #avatar-container.ytd-rich-grid-media,
    ytd-rich-grid-media a#avatar-link {
        display: none !important;
    }
    `
  );
};

// ---- Show full video titles (2行省略を解除) ----
const optionDisplayFullTitle = (displayFullTitle) => {
  if (!displayFullTitle) {
    removeElementById(KeyDisplayFullTitle);
    return;
  }
  addStyle(
    KeyDisplayFullTitle,
    `
    .ytLockupMetadataViewModelStandard.ytLockupMetadataViewModelRichGridLegacyTypography .ytLockupMetadataViewModelTitle,
    .yt-lockup-metadata-view-model--standard.yt-lockup-metadata-view-model--rich-grid-legacy-typography .yt-lockup-metadata-view-model__title,
    ytd-grid-video-renderer #video-title.yt-simple-endpoint.ytd-grid-video-renderer,
    ytd-rich-grid-media[mini-mode] #video-title.yt-simple-endpoint.ytd-grid-video-renderer,
    ytd-grid-video-renderer #video-title.ytd-rich-grid-media,
    ytd-rich-grid-media[mini-mode] #video-title.ytd-rich-grid-media,
    .yt-lockup-metadata-view-model-wiz--standard.yt-lockup-metadata-view-model-wiz--rich-grid-legacy-typography .yt-lockup-metadata-view-model-wiz__title {
      max-height: unset;
      -webkit-line-clamp: unset;
    }
    #video-title.ytd-compact-video-renderer,
    #video-title.ytd-rich-grid-media,
    #video-title.ytd-video-renderer,
    #video-title.ytd-rich-grid-slim-media,
    #video-title.ytd-grid-playlist-renderer,
    #video-title.ytd-reel-item-renderer {
      max-height: unset;
      -webkit-line-clamp: unset;
    }
  `
  );
};

// ---- Hide shorts shelves across feeds ----
const optionHideShort = (hideShort) => {
  if (!hideShort) {
    removeElementById(KeyHideShort);
    return;
  }

  addStyle(
    KeyHideShort,
    `
    /* ---- Home Feed ---- */
    [page-subtype='home'] ytd-rich-section-renderer:has(a[href^="/shorts/"]) {
      display: none;
    }

    /* ---- Watch Feed ---- */
    ytd-watch-grid ytd-rich-shelf-renderer[is-shorts],
    ytd-watch-flexy ytd-rich-shelf-renderer[is-shorts],
    ytd-watch-flexy ytd-reel-shelf-renderer {
      display: none;
    }

    /* ---- Subscription Feed ---- */
    [page-subtype="subscriptions"] ytd-item-section-renderer:has(a[href^="/shorts/"]),
    [page-subtype="subscriptions"] ytd-rich-section-renderer:has(a[href^="/shorts/"]),
    [page-subtype="subscriptions"] ytd-grid-video-renderer:has(a[href^="/shorts/"]),
    [page-subtype="subscriptions"] ytd-rich-item-renderer:has(a[href^="/shorts/"]) {
      display: none;
    }

    /* ---- Hashtag Feed ---- */
    [page-subtype="hashtag-landing-page"] ytd-rich-item-renderer:has(a[href^="/shorts/"]) {
      display: none;
    }

    /* ---- Channel Feed ---- */
    [page-subtype="channels"] ytd-item-section-renderer:has(a[href^="/shorts/"]) {
      display: none;
    }

    /*  ---- Search Feed ---- */
    ytd-search ytd-reel-shelf-renderer:has(a[href^="/shorts/"]),
    ytd-search ytd-video-renderer:has(a[href^="/shorts/"]) {
      display: none;
    }
  `
  );
};

// ---- Channel page wide layout ----
const optionWideChannelLayout = (wideLayout) => {
  if (!wideLayout) {
    removeElementById(KeyChannelPageWideLayout);
    return;
  }

  addStyle(
    KeyChannelPageWideLayout,
    `
    [page-subtype="channels"] ytd-two-column-browse-results-renderer:has(ytd-rich-grid-renderer:not([is-shorts-grid])) {
      max-width: 100% !important;
      width: 100% !important;
    }
    [page-subtype="channels"] ytd-two-column-browse-results-renderer:has(ytd-rich-grid-renderer:not([is-shorts-grid])) #primary.ytd-two-column-browse-results-renderer {
      padding-inline: 20px;
    }
  `
  );
};

// ---- Posts per row (実セル幅をCSS変数から計算) ----
const optionPostsPerRow = () => {
  addStyle(
    KeyPostPerRow,
    `
    ytd-rich-item-renderer[is-post] {
        width: calc(100%/var(--ytd-rich-grid-posts-per-row) - var(--ytd-rich-grid-item-margin) - 0.01px) !important;
    }
  `
  );
};

// ---- Shorts per row (ホーム/購読フィードのショート棚) ----
const optionShortsPerRow = (amount) => {
  addStyle(
    KeyShelfItemPerRow,
    `
    [page-subtype="home"] ytd-rich-shelf-renderer[is-shorts] ytd-rich-item-renderer[is-slim-media],
    [page-subtype="subscriptions"] ytd-rich-shelf-renderer[is-shorts] ytd-rich-item-renderer[is-slim-media] {
      width: calc(100%/${amount} - var(--ytd-rich-grid-item-margin) - 0.01px) !important;
    }
    [page-subtype="home"] ytd-rich-shelf-renderer[is-shorts] ytd-rich-item-renderer[is-slim-media]:nth-child(n + ${amount + 1}),
    [page-subtype="subscriptions"] ytd-rich-shelf-renderer[is-shorts] ytd-rich-item-renderer[is-slim-media]:nth-child(n + ${amount + 1}) {
      display: none !important;
    }
  `
  );
};

// ---- Skeleton(読み込み中プレースホルダー)の幅も列数に合わせる ----
const optionSkeletonPerRow = (videoPerRow) => {
  addStyle(
    KeyVideoPerRow,
    `
  #home-page-skeleton .rich-grid-media-skeleton,
  #home-page-skeleton .rich-shelf-videos .rich-grid-media-skeleton.mini-mode,
  #home-page-skeleton #home-container-media .rich-grid-media-skeleton.mini-mode {
    min-width: calc(100% / ${videoPerRow} - 1.6rem) !important;
    max-width: calc(100% / ${videoPerRow} - 1.6rem) !important;
  }
  `
  );
};

const injectAllChanges = (data) => {
  optionHideChannelProfile(data[KeyHideChannelProfile]);
  optionDisplayFullTitle(data[KeyDisplayFullTitle]);
  optionSkeletonPerRow(data[KeyVideoPerRow]);
  optionHideShort(data[KeyHideShort]);
  optionWideChannelLayout(data[KeyChannelPageWideLayout]);
  optionShortsPerRow(data[KeyShelfItemPerRow]);
};

const removeAllChanges = () => {
  removeElementById(KeyHideChannelProfile);
  removeElementById(KeyDisplayFullTitle);
  removeElementById(KeyVideoPerRow);
  removeElementById(KeyHideShort);
  removeElementById(KeyChannelPageWideLayout);
  removeElementById(KeyShelfItemPerRow);
  removeElementById(KeyPostPerRow);
};

(() => {
  let allData;

  chrome.storage.onChanged.addListener(async (changes) => {
    if (changes[KeyExtensionStatus]) {
      // ポップアップのマスタートグルがOFFにされた場合は、ページのリロードなしで
      // ただちに注入済みのスタイルを取り除く(列数自体はMAIN world側が
      // 別途イベントで受け取り responsive 計算を止める)。
      if (!changes[KeyExtensionStatus].newValue) {
        removeAllChanges();
      } else {
        allData = await getAllStorage(settingKey);
        injectAllChanges(allData);
        optionPostsPerRow();
      }
      return;
    }

    allData = await getAllStorage(settingKey);
    if (!allData[KeyExtensionStatus]) {
      return;
    }
    injectAllChanges(allData);
  });

  const main = async () => {
    const extensionStatus = await getStorage(KeyExtensionStatus);
    if (!extensionStatus) {
      return;
    }

    allData = await getAllStorage(settingKey);
    injectAllChanges(allData);
    optionPostsPerRow();
  };

  main();
})();
