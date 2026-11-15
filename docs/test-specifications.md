# テスト仕様書 (Test Specifications)

本ドキュメントは、`src/test/` 配下のテストコード（JSDoc / docstring）から自動抽出・生成されたテスト仕様一覧です。

- **総テストスイート数**: 20
- **総テストケース数**: 123
- **生成スクリプト**: `scripts/generate-test-docs.js` (`npm run doc` にて自動更新)

## 目次

1. [ParseDocumentUseCase with Table View & Drill-down (14件)](#parsedocumentusecase-with-table-view-drill-down)
2. [CellPath (5件)](#cellpath)
3. [StructuredDocument Operations (8件)](#structureddocument-operations)
4. [TableView Domain Model (4件)](#tableview-domain-model)
5. [TreeFlattener (4件)](#treeflattener)
6. [Extension Test Suite (1件)](#extension-test-suite)
7. [JsonDocumentParser (14件)](#jsondocumentparser)
8. [WebviewRenderer (3件)](#webviewrenderer)
9. [Tiptap Editor Extensions Integration (10件)](#tiptap-editor-extensions-integration)
10. [markdownCodec - Markdown <-> HTML Codec (12件)](#markdowncodec---markdown---html-codec)
11. [React Webview App (11件)](#react-webview-app)
12. [Breadcrumbs Component (2件)](#breadcrumbs-component)
13. [ColumnVisibilityMenu Component (3件)](#columnvisibilitymenu-component)
14. [EditableCell Component (4件)](#editablecell-component)
15. [Pagination Component (4件)](#pagination-component)
16. [Webview UI hooks (7件)](#webview-ui-hooks)
17. [Webview message protocol (1件)](#webview-message-protocol)
18. [table view model (8件)](#table-view-model)
19. [TSV Generation Utilities (5件)](#tsv-generation-utilities)
20. [vscodeApi wrapper (3件)](#vscodeapi-wrapper)

---

## 1. ParseDocumentUseCase with Table View & Drill-down

- **テストファイル**: [`src/test/application/ParseDocumentUseCase.test.ts`](../src/test/application/ParseDocumentUseCase.test.ts)
- **ケース数**: 14

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `should parse top-level JSON array into table mode with columns and rows (simple-list.json style)` | トップレベルJSON配列のスプレッドシート（table）モード判定と列・行のDTOマッピング確認 | オブジェクト配列のJSON文字列を入力した際、viewModeが'table'となり、キー一覧から列定義が生成され、各セルの値が正確に抽出されることを検証する。 |
| 2 | `should parse top-level YAML array into table mode` | トップレベルYAML配列のスプレッドシート（table）モード判定確認 | リスト構造を持つYAML文字列を入力した際、viewModeが'table'と判定され、行数および列キー（id, name, score）が正しく抽出されることを検証する。 |
| 3 | `should parse top-level JSON object into kv mode and identify sub-arrays for drill-down` | トップレベルJSONオブジェクトのKVモード判定とドリルダウン用ネスト配列の検出確認 | オブジェクト直下にプリミティブ配列やオブジェクト配列が存在する場合、viewModeが'kv'となり、サブ配列（subArrays）としてパス、要素数、オブジェクト配列フラグが正確に抽出されることを検証する。 |
| 4 | `should include intermediate object nodes and correct keys/depths for deeply nested structures (nested-service style)` | 深くネストされた構造における中間オブジェクトノード、インデント深度（depth）、キー名の正確性確認 | service や network.ingress などのネスト階層を持つYAMLを入力した際、中間親ノードの行が生成され、正しい深さ（depth 1, 2, 3）とキー名が階層構造として反映されることを検証する。 |
| 5 | `should add a row to top-level array via AddTableRowUseCase` | AddTableRowUseCase によるテーブル行の末尾追加と型デフォルト値初期化の確認 | 既存のオブジェクト配列に対し行追加ユースケースを実行した際、行数が1つ増加し、既存列定義に応じた初期値（数値は0、文字列は空文字）で新しい行が追加されることを検証する。 |
| 6 | `should add a column to array objects via AddTableColumnUseCase` | AddTableColumnUseCase によるテーブル列追加と全レコードへのプロパティ反映確認 | オブジェクト配列に対し新規列名（'age'）を追加した際、すべてのオブジェクトの末尾に該当プロパティが空文字初期値で均一に追加されることを検証する。 |
| 7 | `should add a column to a primitive array by converting elements to objects` | プリミティブ配列に対する列追加時のオブジェクト配列化（スキーマ拡張）の確認 | 文字列の配列（hosts）に対して新しい列（port）を追加した際、各プリミティブ要素が既存値キー（col1）と新規列キーを持つオブジェクトへと構造変換されることを検証する。 |
| 8 | `should parse top-level array with objects containing nested array (users-with-nested-array style)` | オブジェクト内にネストされた配列を持つスプレッドシートの列型推論確認 | 配列プロパティ（skills: string[]）を含むオブジェクト配列を入力した際、該当列の型が 'array'、アイコンシンボルが '[ ]' として認識されることを検証する。 |
| 9 | `should rename a column in an object array and replace keys across all objects` | RenameTableColumnUseCase によるテーブル列名リネームと全オブジェクトへの置換反映確認 | オブジェクト配列の列名（'name' -> 'fullName'）を変更した際、配列内の全要素の旧キーが新キーへと一括置換されることを検証する。 |
| 10 | `should convert a primitive array inside an object to an array of objects when renaming column` | プリミティブ配列の列名リネームに伴うオブジェクト配列への自動構造変換確認 | ネストされたプリミティブ配列（単一列 `[ ]`）の列名を 'host' に変更した際、各要素が `{ host: "..." }` というオブジェクトに変換され、以降オブジェクト配列として認識されることを検証する。 |
| 11 | `should rename column in YAML document` | YAMLドキュメントにおける列名リネームとYAMLシリアライズの整合性確認 | YAML形式のドキュメント内のネストされたプリミティブ配列に対して列名変更を実行した際、YAMLのインデント構造を維持したままオブジェクトリスト形式へ変換・保存されることを検証する。 |
| 12 | `should parse JSONL into table mode with columns and rows` | JSONLドキュメントのスプレッドシート（table）モード判定と列・行のDTOマッピング確認 | 未記載 |
| 13 | `should add table row in JSONL document through use case` | JSONLドキュメントに対するテーブル行追加ユースケースの動作検証 | 未記載 |
| 14 | `should parse CSV/TSV in both header and headerless modes and preserve header-only CSV columns` | CSVおよびTSVドキュメントのヘッダー有無（hasHeader）切り替えと型バッジ判定の確認 | CSVをhasHeader: trueおよびfalseで解析した際の列定義・型シンボル推論・ドット入り列名更新、およびヘッダーのみのTSVへの行追加動作を検証する。 |

## 2. CellPath

- **テストファイル**: [`src/test/domain/CellPath.test.ts`](../src/test/domain/CellPath.test.ts)
- **ケース数**: 5

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `parses empty string to empty segments` | 空文字列のパース処理と境界値動作の確認 | 空文字列を与えた際に、セグメント配列が空となり、文字列化しても空文字に戻ることを検証する。 |
| 2 | `parses simple property name` | 単一プロパティ名（ルート直下のキー）のパース処理の確認 | 単一の文字列キーを与えた際、セグメント配列にその文字列1件のみが格納され、正しく文字列化されることを検証する。 |
| 3 | `parses nested dot-notation paths` | ドット記法（ネスト構造）のパース処理と階層深度（depth）計算の確認 | 'user.address.city' のような複数階層のパスを与えた際、各プロパティ名に分解され、depthが階層数（3）と一致することを検証する。 |
| 4 | `parses array indexed paths` | 配列インデックス記法（`[n]`）を含む複合パスのパース処理の確認 | 'items[0].tags[2].label' のようにオブジェクトと配列添字が混在するパスを与えた際、添字が数値型セグメントとして正確に抽出されることを検証する。 |
| 5 | `handles parent, append, and child relations` | 親子パスの関係性判定（parent, append, isChildOf, equals）の確認 | パスにセグメントを追加（append）した際に、正しい子パスが生成され、親子関係判定（isChildOf）やparentプロパティの等価性が正しく機能することを検証する。 |

## 3. StructuredDocument Operations

- **テストファイル**: [`src/test/domain/StructuredDocumentOperations.test.ts`](../src/test/domain/StructuredDocumentOperations.test.ts)
- **ケース数**: 8

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `should rename a key in an object preserving key order` | オブジェクトキー名の変更（リネーム）およびキー順序の保全確認 | オブジェクト内の特定のキー（'b' -> 'bRenamed'）をリネームした際、値（2）が維持され、かつキーの並び順（'a', 'bRenamed', 'c'）が崩れずに保たれることを検証する。 |
| 2 | `should rename a nested key in an object` | 階層構造の深い位置（ネストされたオブジェクト）におけるキーリネームの確認 | 'network.ingress.port' のような深いパスのキーを 'targetPort' にリネームした際、旧キーが削除され、親・祖先構造を壊さずに該当キーのみが更新されることを検証する。 |
| 3 | `should move a row in an array` | 配列内の要素（行）の並び替え（D&D移動）の確認 | 配列内の特定インデックスの要素（index 2 の Charlie）を別の位置（index 0）に移動させた際、要素順が意図通りに再配置されることを検証する。 |
| 4 | `should move a table column across objects in an array` | テーブル列の並び替え（全オブジェクトのプロパティ順変更）の確認 | オブジェクト配列において、特定列（index 2 の 'role'）を先頭（index 0）に移動させた際、全レコード内のキー定義順が同期して並び変わることを検証する。 |
| 5 | `should delete an item in an array by path` | 配列要素の削除（文字列・数値インデックスパス経由）の確認 | CellPath（'1'）を指定して配列の中間要素を削除した際、対象要素のみが配列から splice され、配列長が縮小して後続要素が前に詰まることを検証する。 |
| 6 | `should delete a key in an object by path` | オブジェクトプロパティ（キー）の削除の確認 | CellPath（'b'）を指定してオブジェクト内のキーを削除した際、該当キーおよびその値のみがオブジェクトから除去され、他のキーは保持されることを検証する。 |
| 7 | `should clear values of a specific column in a table array` | テーブル列の値クリア操作の確認 | オブジェクト配列内の指定カラム（'role'）をクリアした際、各レコードのキー自体は残り、値のみが空文字列に更新されることを検証する。 |
| 8 | `should clear all data cells in a table array` | テーブル全データセルの値クリア操作の確認 | オブジェクト配列内の全レコードのデータセルの値をクリアした際、各キーの構造は保持されたまま、全フィールド値が空文字列に更新されることを検証する。 |

## 4. TableView Domain Model

- **テストファイル**: [`src/test/domain/TableView.test.ts`](../src/test/domain/TableView.test.ts)
- **ケース数**: 4

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `should build a 2D table from an array of objects (like simple-list.json)` | オブジェクト配列からの2次元スプレッドシートモデル生成の確認 | オブジェクトの配列（id, name, role, active）から TableView を構築し、isObjectArrayフラグ、行数、列定義、各行セルの値およびCellPathが正確にマッピングされることを検証する。 |
| 2 | `should handle missing keys gracefully by assigning null cell values` | レコード間でキーの有無が異なる（欠損キーがある）データの寛容な処理確認 | 1行目に存在して2行目に存在しないキー、および2行目のみに存在するキーがある場合、全列が集約され、欠損値セルには null が補完されてクラッシュしないことを検証する。 |
| 3 | `should build a single-column table from a primitive array` | 文字列・数値などのプリミティブ配列からの単一列テーブルモデル構築の確認 | 文字列の配列（['apple', 'banana', 'cherry']）を与えた際、isObjectArrayがfalseとなり、単一列（列名 `[ ]`）として各インデックスパス（`[1]`など）とともに正しく生成されることを検証する。 |
| 4 | `should correctly detect column types and symbols including nested arrays` | 列のデータ型推論および型シンボルアイコン（1234, T/F, [ ], { }, Aa）の正確性の確認 | 数値（id -> '1234'）、文字列（name -> 'Aa'）、真偽値（active -> 'T/F'）、配列（skills -> '[ ]'）、オブジェクト（meta -> '{ }'）の各列型推論が、先頭サンプリングによって正しく判定されることを検証する。 |

## 5. TreeFlattener

- **テストファイル**: [`src/test/domain/TreeFlattener.test.ts`](../src/test/domain/TreeFlattener.test.ts)
- **ケース数**: 4

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `flattens a simple flat object` | フラットな単一階層オブジェクトの平坦化（flatten）処理の確認 | ネストのない単純なキー・値ペア（name, age）を平坦化し、期待される行数、displayPath、および値が正確に抽出されることを検証する。 |
| 2 | `flattens deeply nested objects` | 多階層にネストされたオブジェクトの平坦化（flatten）処理の確認 | server.ports.http のようにネストされたオブジェクトを平坦化し、ドット記法のフルパス（displayPath）として各リーフ値が展開されることを検証する。 |
| 3 | `flattens arrays of objects` | オブジェクトの配列を含むツリーの平坦化（flatten）処理の確認 | 配列内の各オブジェクト要素を展開した際、`[0].id` や `[1].name` のようなインデックス付きパスとして平坦化されることを検証する。 |
| 4 | `unflattens flat rows back into original nested structure` | 平坦化された行リストからの元ツリー構造の復元（unflatten）の可逆性確認 | オブジェクトや配列が混在するネスト構造を flatten し、それを unflatten して元のJavaScriptオブジェクトと完全一致（等価）に復元できることを検証する。 |

## 6. Extension Test Suite

- **テストファイル**: [`src/test/extension.test.ts`](../src/test/extension.test.ts)
- **ケース数**: 1

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `Sample test` | VS Code拡張機能ホスト環境の起動と基本的なアサーション動作確認 | VS Codeテストランナー上でテスト環境が正常に初期化され、基本配列操作のアサーションが成功することを検証する。 |

## 7. JsonDocumentParser

- **テストファイル**: [`src/test/infrastructure/Parsers.test.ts`](../src/test/infrastructure/Parsers.test.ts)
- **ケース数**: 14

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `parses and serializes JSON with 2-space indentation` | JSONのフォーマット保全（2スペースインデント、末尾改行）を伴うパースおよびシリアライズの確認 | 2スペースインデントと末尾改行を持つJSON文字列をパースし、特定セル値を更新した後にシリアライズした際、元のインデントおよび改行形式が正確に保たれることを検証する。 |
| 2 | `handles nested objects in JSON` | 深くネストされたJSONオブジェクトの構造解析と平坦化確認 | 多重ネストされたJSON（a.b.c）をパースし、toFlatRows() を介してドット区切りの正しいパスと値が抽出されることを検証する。 |
| 3 | `parses JSON with comments (JSONC)` | コメント付きJSON（JSONC: settings.jsonやtsconfig.jsonなど）のパース確認 | 行コメント（//）およびブロックコメント（/* ... *\/）が含まれるJSON文字列をエラーなくパースできることを検証する。 |
| 4 | `parses and serializes YAML` | YAMLドキュメントのパース、セル値更新、および再シリアライズの確認 | ネストを含むYAML文字列をパースして構造を抽出し、ブール値セル（settings.enabled: true -> false）を更新してシリアライズした際、正しくYAML形式のまま値が更新出力されることを検証する。 |
| 5 | `supports jsonl and ndjson extensions` | 拡張子サポート判定（jsonl, ndjson）の確認 | 未記載 |
| 6 | `parses JSONL into array root, updates cell and serializes correctly` | JSONLのパース、トップレベル配列としての認識、セル値更新、および再シリアライズの確認 | 未記載 |
| 7 | `handles empty lines and comments in JSONL` | 空行スキップおよびコメント付きJSONL（JSONC対応）の検証 | 未記載 |
| 8 | `supports adding and deleting table rows in JSONL` | 行追加・行削除の操作とシリアライズ確認 | 未記載 |
| 9 | `handles empty text gracefully` | 空ドキュメントの安全なパースとシリアライズ | 未記載 |
| 10 | `supports csv and tsv extensions respectively` | 拡張子サポート判定（csv, tsv）の確認 | CsvDocumentParser が csv/.csv のみをサポートし、TsvDocumentParser が tsv/.tsv のみをサポートすることを検証する。 |
| 11 | `parses CSV with header, infers primitive types, updates cell, and serializes` | ヘッダー付きCSVのパース、型自動推論（数値・真偽値・先頭ゼロ文字列維持）、セル更新・シリアライズの確認 | 1行目をヘッダーとしてCSVを解析し、数値・真偽値・先頭ゼロ文字列（0012）の型が正しく推論され、カンマを含む値へのセル更新後にクォート付きでシリアライズされることを検証する。 |
| 12 | `parses and serializes CSV without header when hasHeader is false` | ヘッダーなし（hasHeader: false）モードでのCSVパースとシリアライズの確認 | hasHeader: false 指定時に1行目からデータ行（col1, col2, col3）として解析され、シリアライズ時もヘッダー行を出力せずデータ行のみ出力されることを検証する。 |
| 13 | `handles escaped quotes and multiline cells in CSV` | RFC 4180 ダブルクォートエスケープ（""）およびセル内改行のパース・シリアライズ確認 | ダブルクォートの二重エスケープや改行を含むCSVセルが1つのセル文字列として正確に解析され、再シリアライズで元のRFC 4180表現に戻ることを検証する。 |
| 14 | `parses and serializes TSV correctly` | TSVドキュメントのパースおよびシリアライズ確認 | CRLF改行およびタブ区切りを持つTSV文字列をパースし、セル値更新後もCRLF改行とタブ区切りを維持してシリアライズされることを検証する。 |

## 8. WebviewRenderer

- **テストファイル**: [`src/test/infrastructure/WebviewRenderer.test.ts`](../src/test/infrastructure/WebviewRenderer.test.ts)
- **ケース数**: 3

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `renders a CSP-protected HTML shell with local assets` | Webview の実行に必要な最小 HTML shell とローカル bundle を出力すること | 未記載 |
| 2 | `escapes HTML-like initial data before embedding it in the shell` | 初期データ内のタグをスクリプトとして解釈させないこと | 未記載 |
| 3 | `renders the error view with the same CSP protections` | 構文エラー画面にも同じ CSP と nonce を適用すること | 未記載 |

## 9. Tiptap Editor Extensions Integration

- **テストファイル**: [`src/test/md-webview/editorExtensions.test.ts`](../src/test/md-webview/editorExtensions.test.ts)
- **ケース数**: 10

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `toggles Mermaid source editor visibility when clicking the edit source button without resetting NodeView` | Mermaidコードブロックのソース編集表示切り替え動作 | Mermaid言語指定のコードブロックで「ソースを編集」ボタンをクリックした際、NodeViewがリセットされることなくコード領域の表示・非表示が切り替わることを検証する。 |
| 2 | `keeps Python code block source always visible and hides Mermaid toggle button` | 通常言語（Python）コードブロックの常時ソース表示 | Python言語のコードブロックではソースコード領域が常時表示され、Mermaid用のソース切り替えボタンが非表示になることを検証する。 |
| 3 | `renders Admonition NodeView and updates attributes via header controls` | Admonition拡張NodeViewのヘッダーUIによる属性更新とシリアライズ反映 | Admonitionブロックのモード・タイプ・タイトル入力欄を変更した際、ノード属性が更新され、対応するMarkdown記法（??? warning "タイトル"）として出力されることを検証する。 |
| 4 | `renders KaTeX inline and block math nodes with katex output` | KaTeX数式ノードのDOM描画とMarkdownシリアライズ保持 | インライン数式とブロック数式がKaTeXによってDOM描画され、かつエディタからHTML経由でMarkdownへ変換した際に数式が欠落せず保持されることを検証する。 |
| 5 | `reveals Markdown syntax markers (#, **) only on the active cursor line/mark` | カーソル位置に応じたMarkdown記法マーカーの動的表示（Live Preview） | 見出しや太字箇所にカーソルが当たっている時のみ ## や ** の構文マーカーが表示され、カーソルが外れると非表示になることを検証する。 |
| 6 | `switches color scheme between Light (default) and Dark (slate) via toolbar` | ツールバーによるライト（default）・ダーク（slate）テーマ切り替え | 上部ツールバーのテーマ切り替えボタンを押下した際、data-md-color-scheme属性とボタンラベルがLight/Dark間で正しく切り替わることを検証する。 |
| 7 | `preserves relative file links and attaches data-link-href to link syntax markers` | 相対パスリンク（../.agents/...）の href 属性保持と Live Preview マーカーへの data-link-href 付与 | ドット始まりや親ディレクトリ参照を含む相対パスリンクが Tiptap Link 拡張によって欠落せず保持され、カーソル接触時の構文マーカーにも data-link-href 属性が付与されることを検証する。 |
| 8 | `hides Markdown syntax markers when editor is in ReadOnly mode` | ReadOnly モード時の Live Preview 構文マーカー非表示 | editor.setEditable(false) の状態で見出しや太字行にカーソルを置いても、## や ** などの rawtext 構文マーカーが表示されないことを検証する。 |
| 9 | `renders ReadOnly, SplitView, and Index toggles with expected defaults and toggles state` | ツールバーの ReadOnly / 左右分割 / Index トグル初期値と切り替え動作 | ReadOnly(OFF)・左右分割(OFF)・Index(ON) の各トグルボタンが初期状態で表示され、クリックで状態が切り替わることを検証する。 |
| 10 | `renders heading index list and scrolls to heading on click` | Index パネルの見出し一覧描画とクリックによる見出しジャンプ | ドキュメント内の見出しが Index パネルに一覧表示され、項目クリックで対象見出し要素へスクロールジャンプすることを検証する。 |

## 10. markdownCodec - Markdown <-> HTML Codec

- **テストファイル**: [`src/test/md-webview/markdownCodec.test.ts`](../src/test/md-webview/markdownCodec.test.ts)
- **ケース数**: 12

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `extracts YAML frontmatter and body accurately` | YAML Frontmatterと本文の分離抽出 | 先頭に --- で囲まれたYAMLメタデータを持つMarkdownから、Frontmatter部分と本文部分が正確に分離されることを検証する。 |
| 2 | `preserves YAML frontmatter through markdownToHtml and htmlToMarkdown round-trip` | YAML Frontmatterのラウンドトリップ保持 | markdownToHtmlおよびhtmlToMarkdownの双方向変換を経ても、先頭のYAML Frontmatterが水平線に変換されず完全に保持されることを検証する。 |
| 3 | `converts !!! note with custom title to HTML and back to 4-space indented Markdown` | 標準Admonitionブロックの双方向変換 | !!! note "タイトル" と4スペースインデント本文からなるAdmonition記法がHTML属性付き要素へ変換され、再シリアライズ時に元の4スペースインデント記法へ復元されることを検証する。 |
| 4 | `converts collapsible ??? warning and ???+ tip blocks accurately` | 折りたたみAdmonition（??? / ???+）およびタイトル省略記法の双方向変換 | ??? warning と ???+ tip（タイトル省略）の記法がそれぞれ正しいモード・タイプ属性としてパースされ、元のMarkdownへ正確に復元されることを検証する。 |
| 5 | `serializes nested bullet lists with 4-space indentation` | ネストされた箇条書きリストの4スペースインデント出力 | 親子構造を持つ箇条書きリストが、Python-Markdown規約に準拠した4スペースインデントで再シリアライズされることを検証する。 |
| 6 | `enforces a blank line before top-level lists following a paragraph` | 段落直後のトップレベルリスト前の空行強制 | 段落の直後に配置されたリスト要素が、Markdown出力時に必ず空行（2つの改行）を挟んで出力されることを検証する。 |
| 7 | `preserves GFM task list checked and unchecked states` | GFMタスクリストのチェック状態保持 | チェック済み（- [x]）および未チェック（- [ ]）のタスクリスト項目がTiptap形式のHTMLに変換され、再シリアライズ時に元の状態が保持されることを検証する。 |
| 8 | `preserves Python and Mermaid fenced code blocks without mangling $ or !!! inside code` | コードブロック内の特殊記号（$・!!!）の誤変換防止と言語属性保持 | Python等のフェンス付きコードブロック内に含まれる $ 記号や !!! 文字列が数式やAdmonitionに誤変換されず、そのまま保持されることを検証する。 |
| 9 | `converts inline math $...$ and block math $$...$$ and round-trips cleanly` | インライン数式とブロック数式の双方向変換 | 文中の $...$ および独立ブロックの $$...$$ 数式が専用のHTML要素に変換され、消失することなく元のLaTeX記法へ再シリアライズされることを検証する。 |
| 10 | `parses and serializes GFM tables cleanly` | GFMテーブルのパースと再シリアライズ | MarkdownテーブルがHTMLのtable要素へ変換され、編集後もパイプ区切りのGFMテーブル形式に正しく復元されることを検証する。 |
| 11 | `resolves relative image paths to webview URIs while keeping original path in Markdown` | ローカル相対画像パスのWebview URI変換と元パスの保持 | 相対パスの画像記法が表示用のWebview URIに変換されつつ、data-raw-src属性によって保存時には元の相対パスへ復元されることを検証する。 |
| 12 | `leaves external https image URLs untouched` | 外部URL画像のパス無変換維持 | https:// で始まる外部画像URLはベースURIの付与を行わず、そのままのURLが返されることを検証する。 |

## 11. React Webview App

- **テストファイル**: [`src/test/webview/App.test.tsx`](../src/test/webview/App.test.tsx)
- **ケース数**: 11

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `renders and filters the spreadsheet view` | 表ビューを既存セレクタとともに表示し、検索と列の表示切替ができること | 未記載 |
| 2 | `renders and filters the key-value view` | KV ビューでも検索結果だけを表示できること | 未記載 |
| 3 | `sends update_cell message on cell edit blur` | セル編集で blur または Enter 時に update_cell メッセージを送信すること | 未記載 |
| 4 | `sends add_table_row, add_table_column, and open_text_editor commands` | 行追加・列追加・テキストエディタ切替ボタンのクリックで対応するメッセージを送信すること | 未記載 |
| 5 | `sends rename_table_column on column header label blur` | 列名編集で Enter または blur 時に rename_table_column メッセージを送信すること | 未記載 |
| 6 | `opens context menu and deletes row` | 行ヘッダーのコンテキストメニューから行削除を実行できること | 未記載 |
| 7 | `navigates to sub-array and back via breadcrumbs` | サブ配列ボタンのクリックで配列を展開し、パンくずでルートへ戻れること | 未記載 |
| 8 | `applies saved column widths from state` | 保存された列幅（customColWidths）を初期描画に反映すること | 未記載 |
| 9 | `reorders columns on drag and drop` | 列のドラッグ＆ドロップで列の並び順が更新されること | 未記載 |
| 10 | `navigates sub-array in KV mode and preserves array view across state restoration` | KVモードの配列を「編集する」で開いた後、Webview再読み込み（編集・行追加）が発生しても配列画面を維持すること | 未記載 |
| 11 | `renders CSV header toggle and sends set_csv_header message when toggled` | CSV/TSV ドキュメント表示時に「1行目をヘッダーにする」チェックボックスが表示され、切り替え時に set_csv_header メッセージを送信すること | documentTypeがcsvのデータでAppを描画し、ツールバーのヘッダートグルをクリックした際にset_csv_headerメッセージがpostMessageされることを検証する。 |

## 12. Breadcrumbs Component

- **テストファイル**: [`src/test/webview/Breadcrumbs.test.tsx`](../src/test/webview/Breadcrumbs.test.tsx)
- **ケース数**: 2

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `renders root as current when path is empty or null` | ルートパス時は root/ のみをカレント表示すること | 未記載 |
| 2 | `renders nested path segments and triggers navigation on click` | ネストしたパスでパンくずリンクを階層順に生成し、クリックでナビゲートできること | 未記載 |

## 13. ColumnVisibilityMenu Component

- **テストファイル**: [`src/test/webview/ColumnVisibilityMenu.test.tsx`](../src/test/webview/ColumnVisibilityMenu.test.tsx)
- **ケース数**: 3

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `toggles dropdown visibility on button click` | 初期状態ではメニューが閉じており、ボタンクリックで開閉すること | 未記載 |
| 2 | `toggles column visibility via checkbox` | チェックボックスの操作で列の非表示・再表示が切り替わること | 未記載 |
| 3 | `restores all columns on ` | 「すべて表示」リンクをクリックすると全列が表示状態になること | 未記載 |

## 14. EditableCell Component

- **テストファイル**: [`src/test/webview/EditableCell.test.tsx`](../src/test/webview/EditableCell.test.tsx)
- **ケース数**: 4

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `renders displayValue with data attributes` | 初期値を正しく描画し、data 属性を設定すること | 未記載 |
| 2 | `preserves user typed text during focus even when displayValue prop updates` | 編集中のユーザー入力を React の再描画（props 更新）で上書きしないこと | 未記載 |
| 3 | `commits value and triggers navigation on Enter` | Enter キーで値を確定し、下方向セルへ移動を通知すること | 未記載 |
| 4 | `commits value and triggers navigation on Shift + Tab` | Shift + Tab キーで値を確定し、左方向セルへ移動を通知すること | 未記載 |

## 15. Pagination Component

- **テストファイル**: [`src/test/webview/Pagination.test.tsx`](../src/test/webview/Pagination.test.tsx)
- **ケース数**: 4

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `returns null when totalRows is 100 or less` | 総件数が100件以下の場合は何も表示しないこと | 未記載 |
| 2 | `disables previous and first buttons on page 1` | 1ページ目では前へ・最初ボタンが無効化されること | 未記載 |
| 3 | `calls onPageChange on next and last button clicks` | 次へ・最後のページボタンクリックで onPageChange が呼ばれること | 未記載 |
| 4 | `jumps to a valid page number on Enter in jump input` | 入力欄にページ番号を入力して Enter でジャンプできること | 未記載 |

## 16. Webview UI hooks

- **テストファイル**: [`src/test/webview/hooks.test.tsx`](../src/test/webview/hooks.test.tsx)
- **ケース数**: 7

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `restores and persists state through the VS Code API` | VS Code state を復元し、React state の変更を同じ API へ保存すること | 未記載 |
| 2 | `sets and clears grid selection` | 選択状態を一箇所で設定・解除できること | 未記載 |
| 3 | `restores pending focus after a render` | 保存済みのフォーカス情報を選択状態へ復元してから消費すること | 未記載 |
| 4 | `finds the adjacent visible cell including horizontal wrapping` | Tab の行末折返しと矢印移動の次セルを DTO だけから求められること | 未記載 |
| 5 | `returns the correct CSS class for cell/row/col/all selection` | 選択状態に応じた CSS クラスを正しく返すこと | 未記載 |
| 6 | `provides selectRow, selectCol, and selectAll helpers` | 行選択・列選択・全選択のヘルパーが正しい selection を設定すること | 未記載 |
| 7 | `persists activeArrayPath into uiState on navigation` | 配列パスの解決とフォールバックが正しく行われること | 未記載 |

## 17. Webview message protocol

- **テストファイル**: [`src/test/webview/protocol.test.ts`](../src/test/webview/protocol.test.ts)
- **ケース数**: 1

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `accepts every supported command and its payload` | 定義済みの全コマンドを受信できること | 未記載 |

## 18. table view model

- **テストファイル**: [`src/test/webview/tableView.test.ts`](../src/test/webview/tableView.test.ts)
- **ケース数**: 8

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `returns the correct table path key` | getTablePathKey がパスに応じたキーまたは __root__ を返すこと | 未記載 |
| 2 | `selects the active root or nested table without mutating DTOs` | ルートとネスト配列のテーブルを選択できること | 未記載 |
| 3 | `applies visibility and custom ordering without mutating its inputs` | 非表示列と局所的な列・行順を表示モデルにだけ反映すること | 未記載 |
| 4 | `sorts typed values while preserving empty values at the end` | 数値・真偽値のソートでは空セルを常に末尾に置くこと | 未記載 |
| 5 | `sorts strings with natural alphanumeric comparison` | 文字列の自然順ソート（大文字小文字や数値混じり文字列）が正しく機能すること | 未記載 |
| 6 | `filters rows across all column cell values` | 検索語が空の場合は全件を返し、検索時は全列を横断して絞り込むこと | 未記載 |
| 7 | `filters case-insensitively and clamps pagination to the final page` | 検索結果に表示順の行番号を付け、検索後の最終ページへ補正すること | 未記載 |
| 8 | `clamps negative page numbers and throws on invalid page sizes` | ページ番号が1未満のときは1に補正され、pageSizeが不正な場合は例外を投げること | 未記載 |

## 19. TSV Generation Utilities

- **テストファイル**: [`src/test/webview/tsv.test.ts`](../src/test/webview/tsv.test.ts)
- **ケース数**: 5

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `escapes special characters with quotes and doubles inner quotes` | 特殊文字（タブ、改行、引用符）のエスケープおよび null/undefined の空文字変換 | formatTsvValue に特殊文字を含む文字列や null/undefined を渡した際、タブや改行が二重引用符で囲まれ、二重引用符が二重化され、null/undefined が空文字へ変換されることを検証する。 |
| 2 | `generates TSV for all selection` | 全選択（all）時のTSV文字列生成 | 全選択状態で generateTsv を呼び出した際、ヘッダー行を含み全行・全列のデータがタブ・改行区切りのTSVとして出力されることを検証する。 |
| 3 | `generates TSV for row selection` | 行選択（row）時のTSV文字列生成 | 行選択状態で generateTsv を呼び出した際、指定した単一行の全列値がタブ区切りで出力されることを検証する。 |
| 4 | `generates TSV for column selection` | 列選択（col）時のTSV文字列生成 | 列選択状態で generateTsv を呼び出した際、指定したカラムの全行の値が改行区切りで出力されることを検証する。 |
| 5 | `generates TSV for cell selection` | 単一セル選択（cell）時のTSV文字列生成 | セル選択状態で generateTsv を呼び出した際、対象セルの値のみが出力されることを検証する。 |

## 20. vscodeApi wrapper

- **テストファイル**: [`src/test/webview/vscodeApi.test.ts`](../src/test/webview/vscodeApi.test.ts)
- **ケース数**: 3

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `acquires the VS Code API once and returns the cached singleton` | acquireVsCodeApi を複数回呼ばず、同一のインスタンスをキャッシュして返すこと | 未記載 |
| 2 | `returns undefined from tryGetVsCodeApi when outside VS Code webview` | acquireVsCodeApi が未定義の環境で tryGetVsCodeApi が undefined を返すこと | 未記載 |
| 3 | `throws from getVsCodeApi when outside VS Code webview` | acquireVsCodeApi が未定義の環境で getVsCodeApi がエラーをスローすること | 未記載 |

