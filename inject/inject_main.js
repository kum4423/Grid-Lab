// MAIN world で実行されるスクリプト(YouTubeページ自身のJSスコープ上で動く)。
// ytd-rich-grid-renderer の Polymer prototype をパッチして、
// 1行あたりの表示数(=結果的にサムネイルの拡大縮小)を制御する。
// この手法は cyfung1031 氏の ytZara ライブラリの利用例がベース。
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

  const settings = {};
  const oldSettings = {};

  const resolution = {
    lg: 1000,
    md: 768,
    sm: 640,
  };

  const handleDataEvent = (obj) => {
    const { data } = JSON.parse(obj.detail);
    if (!data || Object.keys(data).length === 0) return;

    if (data.extensionStatus === false) {
      resetLayout();
      return;
    }

    settings.dynamicVideoPerRow = data.dynamicVideoPerRow;
    settings.elementsPerRow = data.videoPerRow;
    settings.postsPerRow = data.postPerRow;
    settings.slimItemsPerRow = data.shelfItemPerRow;
    settings.gameCardsPerRow = data.shelfItemPerRow;

    settings.channelVideoPerRow = data.channelPageVideoPerRow;
    settings.channelSlimItemsPerRow = data.channelPageShelfItemPerRow;

    oldSettings.dynamicVideoPerRow = data.dynamicVideoPerRow;
    oldSettings.elementsPerRow = data.videoPerRow;
    oldSettings.postsPerRow = data.postPerRow;
    oldSettings.slimItemsPerRow = data.shelfItemPerRow;
    oldSettings.gameCardsPerRow = data.shelfItemPerRow;

    oldSettings.channelVideoPerRow = data.channelPageVideoPerRow;
    oldSettings.channelSlimItemsPerRow = data.channelPageShelfItemPerRow;

    reflowLayout(data);
  };

  port.listen(eventSendRowFixerData, handleDataEvent);
  port.callEvent({ name: eventGetRowFixerData, detail: {} });

  // responsive => true: ウィンドウ幅に応じて自動調整する(モバイル幅含む)
  // responsive => false: ユーザー指定の固定値を常に使う
  let responsive = true;
  const setSettings = (elements, posts, slimItems, isResponsive) => {
    settings.elementsPerRow = elements;
    settings.postsPerRow = posts;
    settings.slimItemsPerRow = slimItems;
    settings.gameCardsPerRow = slimItems;
    responsive = isResponsive;
  };

  // ytd-rich-grid-renderer の CSS カスタムプロパティを直接書き換える経路。
  // YouTube側はこの値を元にグリッドの列数とサムネイル幅を計算するため、
  // 列数を変えるだけでサムネイル自体の表示サイズも連動して拡大縮小される。
  // グリッドがまだDOMに存在しない場合はMutationObserverで待機して適用する。
  const applyToGrid = (ele, data) => {
    const {
      channelVideoPerRow,
      channelSlimItemsPerRow,
      videoPerRow,
      postPerRow,
      shelfItemPerRow,
    } = data;

    const setStyleProps = (props) => {
      for (const [prop, value] of Object.entries(props)) {
        ele.style.setProperty(prop, value);
      }
    };

    if (ele.isChannelPage) {
      setStyleProps({
        "--ytd-rich-grid-items-per-row": channelVideoPerRow,
        "--ytd-rich-grid-slim-items-per-row": channelSlimItemsPerRow,
      });
    } else {
      setStyleProps({
        "--ytd-rich-grid-items-per-row": videoPerRow,
        "--ytd-rich-grid-mini-game-cards-per-row": videoPerRow,
        "--ytd-rich-grid-posts-per-row": postPerRow,
        "--ytd-rich-grid-slim-items-per-row": shelfItemPerRow,
        "--ytd-rich-grid-game-cards-per-row": shelfItemPerRow,
      });
    }
  };

  let pendingReflowData = null;
  let reflowObserver = null;

  const reflowLayout = (data) => {
    const grids = document.querySelectorAll("ytd-rich-grid-renderer");

    if (grids.length) {
      grids.forEach((ele) => applyToGrid(ele, data));
      return;
    }

    // グリッドがまだ存在しない(ページ読み込み中)場合は、
    // MutationObserverで出現を待って適用する
    pendingReflowData = data;

    if (reflowObserver) return; // 既に監視中

    reflowObserver = new MutationObserver(() => {
      const grids = document.querySelectorAll("ytd-rich-grid-renderer");
      if (!grids.length || !pendingReflowData) return;
      grids.forEach((ele) => applyToGrid(ele, pendingReflowData));
      pendingReflowData = null;
      reflowObserver.disconnect();
      reflowObserver = null;
    });

    reflowObserver.observe(document.body || document.documentElement, {
      subtree: true,
      childList: true,
    });
  };

  const RESETTABLE_PROPS = [
    "--ytd-rich-grid-items-per-row",
    "--ytd-rich-grid-mini-game-cards-per-row",
    "--ytd-rich-grid-posts-per-row",
    "--ytd-rich-grid-slim-items-per-row",
    "--ytd-rich-grid-game-cards-per-row",
  ];

  // 拡張機能が無効化されたとき、設定済みのCSSカスタムプロパティを除去して
  // YouTube本来のレイアウト計算に戻す。
  const resetLayout = () => {
    const grids = document.querySelectorAll("ytd-rich-grid-renderer");
    grids.forEach((ele) => {
      RESETTABLE_PROPS.forEach((prop) => ele.style.removeProperty(prop));
    });
  };

  const observablePromise = (proc, timeoutPromise) => {
    let promise = null;
    return {
      obtain() {
        if (!promise) {
          promise = new Promise((resolve) => {
            let mo = null;
            const f = () => {
              const t = proc();
              if (t) {
                mo.disconnect();
                mo.takeRecords();
                mo = null;
                resolve(t);
              }
            };
            mo = new MutationObserver(f);
            mo.observe(document, { subtree: true, childList: true });
            f();
            timeoutPromise &&
              timeoutPromise.then(() => {
                resolve(null);
              });
          });
        }
        return promise;
      },
    };
  };

  (async () => {
    await observablePromise(() => {
      return document.querySelector("ytd-page-manager");
    }).obtain();

    ytZara.ytProtoAsync("ytd-rich-grid-renderer").then((proto) => {
      const oldRefreshGridLayout = proto.refreshGridLayout;

      proto.calcElementsPerRowRF = proto.calcElementsPerRow;
      proto.reflowContentRF = proto.reflowContent;

      proto.calcElementsPerRow = function (a, b) {
        if (!responsive) {
          // 固定モード: bはカード最小幅。スリムカード(ショート)は通常250px未満
          return (b && b < 250) ? settings.slimItemsPerRow : settings.elementsPerRow;
        }
        // 自動調整モード(dynamicVideoPerRow=true)は元のロジックに委譲
        return this.calcElementsPerRowRF(a, b);
      };

      proto.calcMaxSlimElementsPerRowRF = proto.calcMaxSlimElementsPerRow;

      proto.calcMaxSlimElementsPerRow = function (a, b, c) {
        if (!responsive) return settings.slimItemsPerRow;
        return this.calcMaxSlimElementsPerRowRF(a, b, c);
      };

      proto.refreshGridLayout = function () {
        responsive = true;

        const isChannelPage = this.isChannelPage;
        const clientWidth = this.hostElement.clientWidth;

        if (settings.dynamicVideoPerRow) {
          if (clientWidth > 0) {
            if (clientWidth <= resolution.sm) {
              setSettings(2, 2, 3, true);
            } else if (clientWidth <= resolution.md) {
              setSettings(3, 3, 4, true);
            } else if (clientWidth <= resolution.lg) {
              setSettings(4, 4, 5, true);
            } else if (isChannelPage) {
              setSettings(
                oldSettings.channelVideoPerRow,
                oldSettings.postsPerRow,
                oldSettings.channelSlimItemsPerRow,
                false
              );
            } else {
              setSettings(
                oldSettings.elementsPerRow,
                oldSettings.postsPerRow,
                oldSettings.slimItemsPerRow,
                false
              );
            }
          }
        } else if (isChannelPage) {
          setSettings(
            settings.channelVideoPerRow,
            settings.postsPerRow,
            settings.channelSlimItemsPerRow,
            false
          );
        } else {
          setSettings(
            settings.elementsPerRow,
            settings.postsPerRow,
            settings.slimItemsPerRow,
            false
          );
        }

        const props = [
          "elementsPerRow",
          "postsPerRow",
          "slimItemsPerRow",
          "gameCardsPerRow",
        ];

        props.forEach((prop) => {
          Object.defineProperty(this, prop, {
            get() {
              return settings[prop];
            },
            set(_nv) {
              return true;
            },
            configurable: true,
            enumerable: true,
          });
        });

        const result = oldRefreshGridLayout.apply(this, arguments);

        props.forEach((prop) => {
          delete this[prop];
          this[prop] = settings[prop];
        });

        return result;
      };
    });

    ytZara.ytProtoAsync("ytd-rich-shelf-renderer").then((proto) => {
      proto.refreshGridLayoutNew = function () {};
    });
  })();
})();
