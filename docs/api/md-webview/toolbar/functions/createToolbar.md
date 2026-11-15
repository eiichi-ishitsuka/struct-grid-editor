[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [md-webview/toolbar](../README.md) / createToolbar

# Function: createToolbar()

> **createToolbar**(`container`, `tableBannerContainer`, `editor`, `callbacks`): `void`

Defined in: [md-webview/toolbar.ts:63](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/toolbar.ts#L63)

エディタ上部のミニマルヘッダーバーおよびテーブル選択時のコンテキスト操作バーを構築します。

## Parameters

### container

`HTMLElement`

上部ヘッダーバーの描画先コンテナ要素

### tableBannerContainer

`HTMLElement`

テーブル操作バーの描画先コンテナ要素

### editor

`Editor`

対象の Tiptap Editor インスタンス

### callbacks

[`ToolbarCallbacks`](../interfaces/ToolbarCallbacks.md)

ツールバー操作のコールバック群

## Returns

`void`
