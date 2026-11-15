[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [md-webview/outline](../README.md) / renderOutline

# Function: renderOutline()

> **renderOutline**(`panel`, `editor`, `onJump?`): `void`

Defined in: md-webview/outline.ts:71

プレビュー画面右上の見出しインデックスパネルを描画・更新します。

## Parameters

### panel

`HTMLElement`

インデックスパネルのコンテナ要素

### editor

`Editor`

対象の Tiptap Editor インスタンス

### onJump?

(`heading`) => `void`

見出しクリック時のカスタムジャンプハンドラ（省略時は既定のスクロールジャンプを実行）

## Returns

`void`
