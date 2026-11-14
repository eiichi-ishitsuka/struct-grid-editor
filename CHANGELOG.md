# Change Log

## 0.1.0 - 2026-11-14

- Markdown ファイルを見たまま編集できる Live Preview / WYSIWYG カスタムエディタ機能（`Markdown Live Preview Editor`）を追加
- カーソル位置の Markdown 記法（見出し・太字・斜体・リンク等）を動的に展開表示する Live Preview 機能を追加
- Admonition（`!!!` / `???` 折りたたみブロック）、YAML Frontmatter、4スペースインデントリストの双方向変換に対応
- GFM テーブル操作バー、タスクリスト、Mermaid ダイアグラムおよび KaTeX 数式のライブプレビュー機能を追加
- クリップボード画像の貼り付け保存および Light / Dark（Slate）カラースキーム切り替え機能を追加
- 拡張子ごとにデフォルトでカスタムエディタで開くかを切り替えられる設定（`struct-grid-editor.openByDefault.*`、初期値では `.md` / `.markdown` と `.jsonl` が有効）を追加
- Source Control (Git) の差分表示時に `.md` / `.markdown` ファイルも標準のテキスト差分エディタで開くよう `workbench.diffEditorAssociations` の自動構成対象に追加

## 0.0.2 - 2026-09-28

- 配列編集時の画面遷移不具合の修正

## 0.0.1 - 2026-09-22

- Initial release
