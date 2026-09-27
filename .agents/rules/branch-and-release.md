# ブランチ戦略・バージョニング・リリースマネジメントルール (Branch and Release Rules)

本リポジトリにおけるブランチ運用、セマンティックバージョニング、およびリリース管理において、AIエージェントおよび開発者が厳守すべきルールを定めます。
詳細な運用仕様は [docs/branch-and-release-strategy.md](../../docs/branch-and-release-strategy.md) を参照してください。

---

## 1. ブランチ戦略 (GitHub Flow)

- **すべての作業ブランチは `main` の最新から作成する**:
  `develop` などの永続ブランチは存在しません。常に `main` をベースとし、`main` に向けてプルリクエスト（PR）を作成します。
- **ブランチ命名規則**:
  作業内容に応じて以下のプレフィックスを使用します。
  - 新機能追加・機能拡張: `feature/<feature-name>` (例: `feature/column-sort`)
  - 通常のバグ修正: `fix/<bug-name>` (例: `fix/tsv-newline`)
  - 緊急バグ修正: `hotfix/<bug-name>` (例: `hotfix/crash-on-open`)
  - リファクタリング: `refactor/<name>`
  - ドキュメント整備: `docs/<name>`
  - 構成・CI修正: `chore/<name>`

---

## 2. セマンティックバージョニングと PR 必須変更

AIエージェントが機能実装・修正を完了し、PRの準備やコミットを行う際は、**必ず以下の2ファイルを変更差分に含めてください**。

### (1) `package.json` の `"version"` 更新
変更の性質に応じて SemVer（`MAJOR.MINOR.PATCH`）を適切にインクリメントします。
- **MAJOR (破壊的変更)**: 互換性のない仕様変更、設定形式の大幅変更
- **MINOR (新機能・機能拡張)**: 後方互換性のある新機能やオプションの追加
- **PATCH (バグ修正・軽微な改善)**: 既存仕様に準じた不具合修正

### (2) `CHANGELOG.md` のリリースノート追記
`CHANGELOG.md` の最上部に、更新後のバージョン番号、日付、および箇条書きの変更内容を追記します。
```markdown
# Change Log

## <新バージョン> - YYYY-MM-DD

- 変更内容（日本語で簡潔に記述）
- 変更内容
```

---

## 3. タグとリリースの自動化認識

- `main` ブランチへのマージ完了時、GitHub Actions ワークフロー (`.github/workflows/release-tag.yml`) により、`package.json` のバージョン番号に基づいた Git タグ（例: `0.1.0`）と GitHub Release が自動作成されます。
- AIエージェントは、手動でのタグ打ちや重複したリリースタグの作成を行わず、`package.json` と `CHANGELOG.md` の更新に専任してください。
