# アーキテクチャルール (Architecture Rules)

本リポジトリは **クリーンアーキテクチャ** および **ドメイン駆動設計 (DDD)** の原則に従って構成されています。
すべての開発・機能追加・リファクタリングにおいて、以下のルールを厳守してください。

---

## 1. レイヤー構造と依存方向の原則

依存は常に **外側から内側** に向かわなければなりません。

```
[Infrastructure Layer]
         ↓ 依存
[Application Layer]
         ↓ 依存
  [Domain Layer] (依存なし)
```

| レイヤー | ディレクトリ | 役割 | 依存許可対象 | 依存禁止対象 |
|---|---|---|---|---|
| **Domain** | `src/domain/` | ビジネスロジック・ドメインモデル・抽象ポート | なし (純粋な TypeScript のみ) | `vscode`, `fs`, 外部ライブラリ (`yaml` 等), Application, Infrastructure |
| **Application** | `src/application/` | ユースケース・DTO | `src/domain/` | `vscode`, UI/Webview, 具象パーサー |
| **Infrastructure** | `src/infrastructure/` | VS Code 拡張連携, Webview レンダリング, 外部パーサー | `src/domain/`, `src/application/`, 外部ライブラリ, `vscode` | なし |

---

## 2. ドメイン層の保護規則

1. **外部依存の禁止**:
   - `src/domain/` 配下のファイルでは `vscode` や `node:fs` などの外部モジュールを import してはならない。
   - 外部ライブラリへの依存が必要な機能は、必ず `src/domain/port/` にインターフェース（ポート）を定義し、インフラ層でアダプターを実装すること（依存性逆転の原則: DIP）。
2. **Value Object の不変性 (Immutability)**:
   - `CellPath`, `CellValue`, `FlatRow`, `DocumentFormat` などの Value Object は、すべてのプロパティを `readonly` とし、変更時は新しいインスタンスを返すこと。
3. **集約ルートによる整合性保護**:
   - ドキュメントへのセル更新・行追加・削除操作は、必ず `StructuredDocument` 集約ルートを経由して行うこと。

---

## 3. アプリケーション層の規則

1. **ユースケースの単一責務**:
   - ユースケースクラスは 1 つの具体的な業務操作（例: `ParseDocumentUseCase`, `UpdateCellUseCase`）に集中させること。
2. **DTO によるデータ受け渡し**:
   - Webview などの外部レイヤーにドメインエンティティを直接露出させず、必ず `GridDataDto` などの DTO に変換して引き渡すこと。

---

## 4. インフラ層の規則

1. **VS Code Provider の薄型化**:
   - `StructGridEditorProvider` 内にデータ構造のパースや編集ロジックを直接記述しないこと。必ず Application Use Case に処理を委譲すること。
2. **新しいファイルフォーマットの追加**:
   - 新しいフォーマット（TOML, XML等）を追加する際は、`IDocumentParser` インターフェースを実装したクラスを `src/infrastructure/parser/` に作成し、`src/extension.ts` で DI 注入すること。

---

## 5. ドキュメントの分離規則
- エンドユーザー向けの拡張機能仕様は `README.md` に記載すること。
- 開発者向けの技術ドキュメント・ビルド・テスト手順は `docs/developer-guide.md` に、設計判断は `docs/adr/` にまとめること（詳細は `.agents/rules/documentation.md` を参照）。

