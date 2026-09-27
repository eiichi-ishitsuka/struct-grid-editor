# ADR 007: Webview の React 化と別バンドル構成の採用

## ステータス
承認済み (Accepted)

## コンテキスト
これまでの StructGridEditor の Webview 実装 (`WebviewRenderer.ts`) は、2,000 行を超える巨大なテンプレート文字列内で HTML、CSS、およびバニラ JavaScript のロジック・イベントリスナーをインライン生成していました。
この構成には以下の課題がありました：
1. **保守性とテスト容易性の低下**: DOM 操作と文字列結合が密結合し、状態管理や UI の挙動を Vitest 等で単体テスト・コンポーネントテストすることが困難だった。
2. **CSP (Content Security Policy) の制限**: スタイルやスクリプトをインラインで注入するため、nonce の管理が肥大化し安全性が制限されていた。
3. **複雑な操作の破綻リスク**: セル編集、キーボードナビゲーション、列リサイズ、DnD、ソート、ページネーションなどの状態がアドホックな変数に分散し、再描画時のフォーカスや入力値の消失リスクが高かった。

## 決定

1. **React 18 + esbuild による独立 Webview バンドル**:
   - 拡張機能本体（Node.js / VS Code API 実行環境）と Webview UI（ブラウザ環境）を明確に分離。
   - `esbuild.js` により、拡張機能用 bundle (`dist/extension.js`) と Webview UI 用 bundle (`dist/webview/main.js`, `dist/webview/main.css`) を別々にビルド。
   - `WebviewRenderer` の責務を純粋な HTML shell 生成（CSP、nonce、アセット URI の安全な埋め込み）に限定。

2. **外部 UI コンポーネントライブラリを初期導入しない判断**:
   - MUI、Chakra UI、Ant Design、ag-Grid などの重量級 UI ライブラリは初期導入せず、Vanilla CSS と React hooks、ブラウザ標準イベント（HTML5 Drag and Drop、Selection API 等）で構築。
   - **理由**:
     - VS Code テーマ変数（`--vscode-*`）との親和性を保ち、ダーク・ライトテーマへの完全追従を担保する。
     - バンドルサイズを最小限に抑え、Webview の高速起動を維持する。
     - 既存の E2E 自動テスト（`vscode-extension-tester`）で利用しているセレクタ（`td.col-val`, `th.col-header-cell`, `#addTableRowBtn` 等）との完全な互換性を維持する。

3. **型安全なメッセージング境界**:
   - `protocol.ts` において、Webview と拡張機能間のメッセージを判別可能な Union 型 (`WebviewMessage`) として定義。
   - 型ガード関数 `isWebviewMessage` を設け、メッセージ受信側・送信側の双方で型安全性を保証。

4. **純粋関数モデルと hooks による状態分離**:
   - 表示ロジック（フィルタリング、ソート、ページング、順序反映）を純粋関数 (`tableView.ts`) として切り出し、DOM なしで 100% 単体テスト可能に。
   - UI 状態・選択・フォーカス復元・キーボード操作をカスタムフック (`useTableView`, `useGridSelection`, `useFocusRestoration`, `useKeyboardNavigation`) へ分離。

## 結果
- `WebviewRenderer.ts` が約 100 行のクリーンな HTML shell 生成クラスとなり、責務が明確になった。
- Webview 内の全機能（セル編集、列/キー名変更、行/列追加、コンテキストメニュー、TSVコピー/切り取り、DnD、列リサイズ）が React コンポーネントと hooks として高速にテスト可能となった。
- 既存の CSP 制約を遵守し、外部 CDN に依存しないセキュアな構成が確立された。
