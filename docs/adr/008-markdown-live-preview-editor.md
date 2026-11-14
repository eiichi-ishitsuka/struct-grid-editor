# ADR 008: Markdown Live Preview エディタの統合と独立 Webview バンドル構成

## ステータス
承認済み (Accepted)

## コンテキスト
これまで StructGridEditor は JSON、YAML、JSONL 形式の構造化データをスプレッドシートおよびツリー形式で編集する機能を提供してきた。一方で、ソフトウェア開発やドキュメント管理においては、構造化データファイル（`.yaml`, `.json`）と並んで Markdown ドキュメント（`.md`, `.markdown`）を同じワークスペース内で横断的に編集するケースが非常に多い。

Markdown ファイルを VS Code 上で直接「見たまま編集（WYSIWYG / Live Preview）」でき、かつ技術文書で多用される Admonition（`!!! note`, `??? warning`）、YAML Frontmatter、4スペースインデントリスト、GFM テーブル、Mermaid 図表、KaTeX 数式、およびローカル画像の貼り付けをサポートする統合エディタが求められた。

統合にあたり、以下の設計課題を解決する必要があった：
1. **既存 StructGridEditor（React 19 Webview）との非干渉**: グリッド用 Webview と Markdown 用 Webview の依存ライブラリやスタイルが互いに干渉せず、それぞれの起動速度を損なわないこと。
2. **初回描画の即時性**: ファイルを開いた瞬間に通信ラウンドトリップや巨大スクリプトのパース待ちを発生させず、最初のフレームで全文を描画すること。
3. **リポジトリ肥大化とビルド負荷の回避**: Mermaid 等の大規模ライブラリを毎回 TypeScript / esbuild で再解析してメモリ不足を引き起こしたり、Git リポジトリに直接巨大ビルド成果物をコミットしたりしないこと。

## 決定

1. **CustomTextEditorProvider の並列登録と独立 Webview バンドル (`dist/md-webview/`)**:
   - `package.json` の `contributes.customEditors` に既存の `struct-grid-editor.jsonEditor` と並べて `struct-grid-editor.markdownEditor`（対象: `*.md`, `*.markdown`）を登録。
   - `src/infrastructure/vscode/MarkdownEditorProvider.ts` を新設し、`src/md-webview/` 配下のモジュールを `dist/md-webview/index.js` として独立バンドルする構成を採用。

2. **Tiptap (ProseMirror) + Marked / Turndown による双方向変換と Live Preview 装飾**:
   - エディタコアには ProseMirror ベースの `@tiptap/*` を採用し、カーソルが当たっている行やインライン装飾のみ `# ` や `**` などの Markdown 記法マーカーを ProseMirror Decoration として動的表示する `LivePreviewExtension` 拡張を実装（カーソル移動でドキュメント変更トランザクションや Undo 履歴汚染を発生させない設計）。
   - `markdownCodec.ts` および `AdmonitionBlock` にて YAML Frontmatter の分離保持、Admonition（`!!!` / `???` / `???+`）の4スペースインデント変換、Python-Markdown 互換のネストリスト出力、およびローカル画像相対パス（`data-raw-src`）の維持を実装。

3. **初期データの HTML 直接埋め込みと Mermaid ランタイムの非同期分離**:
   - `MarkdownEditorProvider` が Webview HTML を生成する際、初期 Markdown テキストと `baseUri` を `<script id="initial-data" type="application/json">` として埋め込み、Webview 起動直後に同期的にパースして初回フレームで描画。
   - `mermaid` パッケージは `esbuild` のバンドル対象から外し、`node_modules/mermaid/dist/mermaid.min.js`（公式ビルド済み UMD）をビルド時に `dist/md-webview/mermaid.js` へコピーして `<script defer>` で非同期読み込みする方式を採用。

## 結果
- 1つの拡張機能パッケージで構造化データ（JSON / YAML / JSONL）のグリッド編集と技術文書（Markdown）のライブプレビュー編集の両方がシームレスに利用可能となった。
- 本体スクリプト (`dist/md-webview/index.js`) が軽量に保たれ、ファイルオープンと同時に待機時間ゼロでエディタが描画されるようになった。
- `markdownCodec.test.ts` および `editorExtensions.test.ts` の計18件の単体テスト（Vitest + jsdom）により、ラウンドトリップ変換と UI 操作の品質が自動検証される体制が整った。
