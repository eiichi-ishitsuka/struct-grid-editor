# ADR 005: Webview レンダラーとユースケースの責務分離

## ステータス
承認済み (Accepted)

## コンテキスト
VS Code Webview は iframe 内部で動作する孤立したブラウザコンテキストです。
以前の実装では、Provider クラス内にインラインで HTML 文字列とスクリプトが生成され、エディタのライフサイクル管理と UI の描画ロジックが混在していました。

## 決定
1. **`WebviewRenderer` の独立**:
   - `GridDataDto` を受け取り、HTML 文字列を生成する純粋なプレゼンタークラスとしてインフラ層に配置。
   - VS Code のネイティブテーマ変数（`--vscode-editor-background`, `--vscode-panel-border` 等）をフル活用し、ダーク/ライトテーマに自動追従。
2. **双方向メッセージングの単純化**:
   - Webview 側からは `update_cell`, `add_row`, `delete_row` の3つのコマンドのみを送信。
   - Provider はこれらを対応する Application Use Case にそのまま委譲。
3. **クライアントサイド機能の強化**:
   - リアルタイム検索フィルター（クライアント側で即座に絞り込み）。
   - 型バッジのカラーリング（string: 緑, number: 青, boolean: 橙 など視認性向上）。

## 結果
- Provider が薄型化し、VS Code API とのつなぎ込みのみに集中できるようになった。
- UI のルック＆フィール変更をドメインやユースケースの変更なしに安全に行えるようになった。
