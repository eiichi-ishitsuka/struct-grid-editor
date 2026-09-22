# 開発者ガイド (Developer Guide)

本ドキュメントは、StructGridEditor の設計、開発環境のセットアップ、ビルド・テスト手順、および拡張ガイドラインをまとめた開発者向け資料です。

---

## 1. アーキテクチャ構成

本プロジェクトは **クリーンアーキテクチャ** および **ドメイン駆動設計 (DDD)** に従って設計されています。

```
src/
├── domain/                  # ドメイン層（外部依存なし、純粋な TypeScript）
│   ├── model/               # StructuredDocument, TreeNode, CellPath, CellValue, FlatRow, DocumentFormat
│   ├── service/             # TreeFlattener, FormatPreserver
│   └── port/                # IDocumentParser
├── application/             # アプリケーション層（ユースケース）
│   ├── usecase/             # ParseDocumentUseCase, UpdateCellUseCase, RowModificationUseCases
│   └── dto/                 # GridDataDto, GridRowDto
├── infrastructure/          # インフラ層（外部ライブラリ・VS Code API・Webview）
│   ├── parser/              # JsonDocumentParser, YamlDocumentParser
│   ├── vscode/              # StructGridEditorProvider
│   └── webview/             # WebviewRenderer
└── extension.ts             # エントリーポイント & DI（依存性注入）コンテナ
```

### 依存の方向
```
[Infrastructure Layer]  -->  [Application Layer]  -->  [Domain Layer]
```
- **ドメイン層 (`src/domain/`)**: VS Code API や Node.js、サードパーティパーサーに一切依存しません。
- **アプリケーション層 (`src/application/`)**: ドメイン層のみに依存し、VS Code や Webview には依存しません。
- **インフラ層 (`src/infrastructure/`)**: ドメインポート（`IDocumentParser` 等）を具象化し、VS Code API や Webview と連携します。

設計の背景や選定理由の詳細は [docs/adr/](adr/) を参照してください。

---

## 2. 開発環境のセットアップ

### 前提要件
- Node.js 20.x 以上
- npm 9.x 以上

### 依存関係のインストール
```bash
npm install
```

---

## 3. ビルドとテスト

### 単体テスト (Vitest)
ドメイン層およびパーサーアダプターの単体テストを実行します。VS Code を起動することなく高速に実行されます。

```bash
npm run test:unit
```

ウォッチモードで実行する場合:
```bash
npx vitest
```

### E2E UI テスト (vscode-extension-tester)
実際の VS Code インスタンス上でWebview（グリッドエディタ）のユーザー操作を Selenium WebDriver で自動検証します。

**前提条件**: GUI デスクトップ環境（または xvfb などの仮想ディスプレイ環境）が必要です。

```bash
# TypeScriptコンパイル + テスト実行（VS CodeとChromeDriverを初回自動ダウンロード）
npm run test:ui-e2e

# コンパイルのみ
npm run compile:ui-test
```

テストファイルの配置:
```
src/ui-test/
├── helpers/test-utils.ts             # 一時フィクスチャ管理・待機ユーティリティ
├── page-objects/StructGridPage.ts    # Webview操作の Page Object
├── basic-operations.test.ts          # Phase 1: JSON/YAML/JSONL表示、セル編集・保存
├── keyboard-navigation.test.ts       # Phase 2: Enter/Tab/Shift+Tab/Ctrl+A
└── row-column-operations.test.ts     # Phase 3: 行・列の追加・削除、テキストエディタ切替
```

> **Note**: E2E テストで使用するサンプルファイルは `samples/` ディレクトリのファイルを一時コピーして使用するため、元ファイルは変更されません。

### 型チェック & Lint & ビルド
TypeScript の型検証、ESLint、および esbuild による本番バンドルを一括実行します。

```bash
npm run compile
```

### 変更監視 (Watch モード)
コードの変更を検知して自動的にバンドルを更新します:
```bash
npm run watch
```

---

## 4. サンプルファイルでのローカル動作検証

`samples/` ディレクトリに各種構造化データの検証用ファイルが用意されています。

```
samples/
├── json/
│   ├── simple-list.json       # オブジェクト配列（フラット）
│   └── nested-config.json     # 多階層ネストの JSON 設定
└── yaml/
    └── nested-service.yaml    # コメント付きのネスト YAML
```

### デバッグ実行方法
1. VS Code で本リポジトリを開きます。
2. `F5` キーを押して「Extension Development Host」ウィンドウを起動します。
3. 新しいウィンドウで `samples/json/nested-config.json` などを開き、エディタ上部の「エディターの表示切り替え」または右クリックの「プログラムから開く...」で **StructGridEditor** を選択します。

---

## 5. 新しいフォーマット（TOML, XML 等）の追加方法

1. **パーサーポートの実装**:
   `src/domain/port/IDocumentParser.ts` を実装した具象クラスを `src/infrastructure/parser/` に作成します。
2. **拡張子のハンドリング**:
   `supports(extension: string): boolean` で対象拡張子（例: `"toml"`）を true と判定するようにします。
3. **DI コンテナへの登録**:
   `src/extension.ts` の `parsers` 配列に新しいパーサーインスタンスを追加します。
4. **package.json の更新**:
   `contributes.customEditors[0].selector` に対象ファイルパターン（例: `{"filenamePattern": "*.toml"}`）を追加します。
5. **テストの作成**:
   `src/test/infrastructure/` 配下にラウンドトリップテストを作成し、書式保持を確認します。

---

## 6. AI開発ワークフローとドキュメント生成

本リポジトリにおけるAIエージェントおよび開発者の作業プロセス、およびドキュメント自動生成ルールは [.agents/rules/ai-development-workflow.md](../.agents/rules/ai-development-workflow.md) に体系化されています。

### 開発サイクル 6ステップ
1. **実装計画の策定**: レイヤー依存や影響範囲を整理し、手戻りを防止。
2. **ADRの作成**: アーキテクチャ変更・ライブラリ選定時は `docs/adr/` に記録。
3. **実装の推進**: ドメイン層（内側）からインフラ層（外側）へ向けて実装。
4. **テストの作成**: 各テスト関数に日本語 JSDoc（`【観点】`・`【テスト内容】`）を付与。
5. **テスト・静的解析のパス確認**: `npm run test:unit`, `npm run check-types`, `npm run lint` の全通過を確認。
6. **ドキュメント生成**: `npm run doc` を実行し、API仕様書およびテスト仕様書（Markdown）を自動更新。

