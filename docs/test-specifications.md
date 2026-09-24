# テスト仕様書 (Test Specifications)

本ドキュメントは、`src/test/` 配下のテストコード（JSDoc / docstring）から自動抽出・生成されたテスト仕様一覧です。

- **総テストスイート数**: 8
- **総テストケース数**: 36
- **生成スクリプト**: `scripts/generate-test-docs.js` (`npm run doc` にて自動更新)

## 目次

1. [ParseDocumentUseCase with Table View & Drill-down (11件)](#parsedocumentusecase-with-table-view-drill-down)
2. [CellPath (5件)](#cellpath)
3. [StructuredDocument Operations (8件)](#structureddocument-operations)
4. [TableView Domain Model (4件)](#tableview-domain-model)
5. [TreeFlattener (4件)](#treeflattener)
6. [Extension Test Suite (1件)](#extension-test-suite)
7. [JsonDocumentParser (3件)](#jsondocumentparser)
8. [WebviewRenderer (0件)](#webviewrenderer)

---

## 1. ParseDocumentUseCase with Table View & Drill-down

- **テストファイル**: [`src/test/application/ParseDocumentUseCase.test.ts`](../src/test/application/ParseDocumentUseCase.test.ts)
- **ケース数**: 11

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
- **ケース数**: 3

| # | テストケース名 | 観点 | テスト内容（検証内容） |
| :--- | :--- | :--- | :--- |
| 1 | `parses and serializes JSON with 2-space indentation` | JSONのフォーマット保全（2スペースインデント、末尾改行）を伴うパースおよびシリアライズの確認 | 2スペースインデントと末尾改行を持つJSON文字列をパースし、特定セル値を更新した後にシリアライズした際、元のインデントおよび改行形式が正確に保たれることを検証する。 |
| 2 | `handles nested objects in JSON` | 深くネストされたJSONオブジェクトの構造解析と平坦化確認 | 多重ネストされたJSON（a.b.c）をパースし、toFlatRows() を介してドット区切りの正しいパスと値が抽出されることを検証する。 |
| 3 | `parses and serializes YAML` | YAMLドキュメントのパース、セル値更新、および再シリアライズの確認 | ネストを含むYAML文字列をパースして構造を抽出し、ブール値セル（settings.enabled: true -> false）を更新してシリアライズした際、正しくYAML形式のまま値が更新出力されることを検証する。 |

## 8. WebviewRenderer

- **テストファイル**: [`src/test/infrastructure/WebviewRenderer.test.ts`](../src/test/infrastructure/WebviewRenderer.test.ts)
- **ケース数**: 0

*テストケースが検出されませんでした。*

