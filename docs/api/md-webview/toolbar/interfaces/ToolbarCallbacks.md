[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [md-webview/toolbar](../README.md) / ToolbarCallbacks

# Interface: ToolbarCallbacks

Defined in: md-webview/toolbar.ts:6

ツールバーのボタン操作時に呼び出されるコールバック群。

## Properties

### getCurrentTheme

> **getCurrentTheme**: () => `"default"` \| `"slate"`

Defined in: md-webview/toolbar.ts:12

現在の表示テーマスキーム名（`'default'` または `'slate'`）を取得します。

#### Returns

`"default"` \| `"slate"`

***

### onSwitchToText

> **onSwitchToText**: () => `void`

Defined in: md-webview/toolbar.ts:8

標準テキストエディタ（ソース表示）への切り替え時に呼び出されます。

#### Returns

`void`

***

### onToggleTheme

> **onToggleTheme**: () => `"default"` \| `"slate"`

Defined in: md-webview/toolbar.ts:10

テーマ（Light / Dark）切り替え時に呼び出され、切り替え後のスキーム名を返します。

#### Returns

`"default"` \| `"slate"`
