# ADR 001: クリーンアーキテクチャおよびDDDの採用

## ステータス
承認済み (Accepted)

## コンテキスト
初期の `StructGridEditorProvider.ts` は200行を超える単一ファイル内に、以下が密結合していました:
- VS Code API (`vscode.CustomTextEditorProvider`, `vscode.workspace.applyEdit`)
- Webview HTML / インライン JavaScript / CSS
- JSON パース / シリアライズ
- データ編集・行追加ロジック

この構成には以下の問題がありました:
1. **テスタビリティの欠如**: ビジネスロジックをテストするために VS Code の Electron 実行環境が必要となり、単体テストを素早く実行できない。
2. **フォーマット拡張の困難さ**: YAML や TOML など新しい構造化データ形式を追加する際に、UI コードやエディタ管理コードに手を入れる必要がある。
3. **責務の過多**: UI の描画、データの変換、ファイルの変更通知が混在し、バグの特定と改修が困難。

## 決定
以下のクリーンアーキテクチャに基づく4層構造を採用しました:

```
[Infrastructure (VS Code / Webview / Parsers)]
         ↓
[Application (Use Cases / DTOs)]
         ↓
[Domain (Models: StructuredDocument, CellPath / Services: TreeFlattener / Ports: IDocumentParser)]
```

1. **ドメイン層 (Domain Layer)**:
   - 外部ライブラリ（VS Code API 等）に一切依存しない純粋な TypeScript。
   - `StructuredDocument` 集約ルート、`CellPath` や `CellValue` の Value Object、`TreeFlattener` ドメインサービスでコアビジネスロジックをカプセル化。
   - 高速な単体テスト（Vitest）を実行可能。
2. **ポートとアダプター (Hexagonal / Clean Architecture)**:
   - `IDocumentParser` ポートをドメイン層に定義し、JSON や YAML の具象パーサーはインフラ層に配置（依存性逆転の原則 DIP）。
3. **アプリケーション層 (Application Layer)**:
   - `ParseDocumentUseCase`, `UpdateCellUseCase`, `AddRowUseCase`, `DeleteRowUseCase` を用意し、エディタ操作のユースケースを明示化。

## 結果
- **利点**:
  - ドメインロジックの単体テストが高速（数百ミリ秒）で実行可能になった。
  - 新しいファイル形式の追加は `IDocumentParser` の実装クラスを1つ追加するだけで可能になった。
  - Webview の UI 変更がドメインロジックに影響を与えなくなった。
- **課題**:
  - ファイル数と抽象度が増加したが、責務が明確になり長期的な保守性は飛躍的に向上した。
