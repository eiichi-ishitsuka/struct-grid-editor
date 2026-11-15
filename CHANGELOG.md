# Change Log

## 0.3.0 - 2026-11-15

- Markdown Live Preview Editor に **Read Mode**（上部ツールバー右側の `Read Mode` トグルで切り替え、デフォルト OFF）を追加し、有効時は行をクリックしても rawtext 記法マーカーが表示されないよう対応
- Markdown Live Preview Editor に **Split View**（上部ツールバー右側の `Split View` トグルで切り替え、デフォルト OFF）を追加し、左側にプレビュー、右側にローテキストエディタを並べてリアルタイム同期編集できるよう対応
- Markdown Live Preview Editor に **Show Index**（上部ツールバー右側の `Show Index` トグルで切り替え、デフォルト ON）を追加し、プレビュー画面右上に表示される見出し一覧からクリックで該当見出しへジャンプできるよう対応
- `Read Mode` / `Split View` / `Show Index` のトグル設定を VS Code 拡張の `globalState` に永続化し、別ファイルを開いても設定が維持されるよう対応

## 0.2.0 - 2026-11-14

- CSV（`*.csv`）および TSV（`*.tsv`）ファイルをスプレッドシート形式で閲覧・編集できる機能を追加（RFC 4180 準拠、セル内改行・クォートエスケープ・数値/真偽値の自動型推論に対応）
- CSV / TSV 表示時にツールバーの「1行目をヘッダーにする」チェックボックスからヘッダー行あり・なしを即座に切り替えられる機能を追加
- デフォルトでカスタムエディタを起動する設定に `struct-grid-editor.openByDefault.csv` および `struct-grid-editor.openByDefault.tsv`（初期値: `true`）を追加
- Markdown Live Preview Editor においてリンクの `Ctrl + クリック`（Mac: `Cmd + クリック`）による遷移機能を強化（ローカル相対パスリンクは存在確認のうえ新規タブで開き、外部 HTTP/HTTPS リンクは確認ダイアログ表示後にブラウザで開くよう改善）

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
