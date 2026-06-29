<div align="center">

<img src="images/gridLab-128.png" width="20%" />

</div>

# YouTube Grid Lab (Firefox版)

YouTubeのホームページ・チャンネルページで、1行あたりの動画/ショート/投稿の表示数を自由に変更できるFirefoxアドオンです。
1行あたりの表示数を変えることで、結果的にサムネイルの表示サイズも拡大・縮小されます。

[sapondanaisriwan/youtube-row-fixer](https://github.com/sapondanaisriwan/youtube-row-fixer) を参考に、
Firefox向けに作り直したものです。対応バージョンは **Firefox 140以降**です(2026年6月時点の最新安定版は152、
2026年7月に153がリリース予定)。

## できること

### ホームページ
- 1行あたりの動画数(1〜15)
- 1行あたりの投稿数(1〜6)
- 1行あたりのショート数(1〜12)
- 画面幅に応じた自動調整のON/OFF
- ショート動画の非表示
- チャンネルアイコンの非表示
- 動画タイトルの全文表示

### チャンネルページ
- 1行あたりの動画数(1〜15)
- 1行あたりのショート数(1〜15)
- 幅いっぱいに表示するワイドレイアウト

### 設定
- ポップアップの配色テーマを20種類から選択(YouTube Red / YouTube Red Light / Ocean Blue / Forest Green / Grape Purple / Sunset Amber / Teal / Sepia / Rose Pink / Slate / Nord / Crimson / OLED Black / Catppuccin / Dracula / Solarized Dark / Pure White / Mint Light / Lavender Light / Sky Light)
- 配色はポップアップの見た目のみを変更し、YouTube側の表示には影響しません

設定はポップアップを開いてスライダー・スイッチで変更でき、変更内容はライブプレビューで確認できます。

## インストール方法(開発者向け・一時的な読み込み)

1. Firefoxで `about:debugging#/runtime/this-firefox` を開く
2. 「一時的なアドオンを読み込む」をクリック
3. このフォルダ内の `manifest.json` を選択

一時読み込みのアドオンはFirefoxを再起動すると消えるので、毎回開発中に試す場合はこの手順を繰り返してください。

## 自分の手元で署名・固定インストールしたい場合

Mozilla公式の `web-ext` ツールを使うと、AMO(addons.mozilla.org)の自己配布用署名を取得できます。

```bash
npm install -g web-ext
cd extension
web-ext sign --api-key=<AMO_JWT_ISSUER> --api-secret=<AMO_JWT_SECRET>
```

API keyはMozillaの [AMO開発者ハブ](https://addons.mozilla.org/developers/addon/api/key/) で取得できます。
署名済みの `.xpi` ができたら、Firefoxにドラッグ&ドロップしてインストールできます。

## 既知の制約

- 拡張機能をインストールした直後や、ポップアップでON/OFFを切り替えた直後は、既に開いているYouTubeのタブには反映が間に合わない場合があります。その場合はタブを再読み込みしてください。
- YouTube側のDOM構造やクラス名が変更されると、表示に影響が出る可能性があります(元プロジェクトと同様の制約です)。

## 技術的な仕組み(参考)

- `manifest_version: 3` を使用し、YouTubeページには `content_script.js` を静的に注入しています。
- 動画/ショート/投稿の表示数変更は、`ytd-rich-item-renderer` の実セル幅を CSS の `width: ... !important` で上書きして実現しています。
  YouTube側が `refreshGridLayout` 内でインライン `style.width` を設定するため、CSSカスタムプロパティやprototype patchには依存しません。
- ショート動画の表示/非表示、タイトル全文表示、ワイドレイアウトなども同じくCSSの `<style>` タグ注入で実現しています。
- ポップアップUIはビルド不要のReact(ローカルにバンドル済み、CDN不使用)で構築しています。
- アイコンは3x3グリッドをモチーフにしたオリジナルデザインです。
- 配色テーマはCSSカスタムプロパティ(`--bg`、`--accent` など)を `<html data-theme="...">` 属性で
  切り替える方式で実装しており、`storage-key.js` の `themeList` にテーマを追加すれば拡張できます。
  選択したテーマは `popupTheme` というキーでローカルストレージに保存され、YouTube側の設定
  (`settingKey` 配列)とは独立しています。

## ライセンス

元プロジェクト(MITライセンス)を参考にFirefox向けに書き直したものです。
