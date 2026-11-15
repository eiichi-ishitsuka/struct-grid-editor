[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [md-webview/toolbar](../README.md) / ToolbarCallbacks

# Interface: ToolbarCallbacks

Defined in: [md-webview/toolbar.ts:6](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/toolbar.ts#L6)

ツールバーのボタン操作時に呼び出されるコールバック群。

## Properties

### getCurrentTheme

> **getCurrentTheme**: () => `"default"` \| `"slate"`

Defined in: [md-webview/toolbar.ts:12](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/toolbar.ts#L12)

現在の表示テーマスキーム名（`'default'` または `'slate'`）を取得します。

#### Returns

`"default"` \| `"slate"`

***

### getOutlineVisible?

> `optional` **getOutlineVisible?**: () => `boolean`

Defined in: [md-webview/toolbar.ts:24](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/toolbar.ts#L24)

現在の見出し Index パネル表示状態を取得します。

#### Returns

`boolean`

***

### getReadOnly?

> `optional` **getReadOnly?**: () => `boolean`

Defined in: [md-webview/toolbar.ts:16](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/toolbar.ts#L16)

現在の ReadOnly 状態を取得します。

#### Returns

`boolean`

***

### getSplitView?

> `optional` **getSplitView?**: () => `boolean`

Defined in: [md-webview/toolbar.ts:20](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/toolbar.ts#L20)

現在の左右分割表示状態を取得します。

#### Returns

`boolean`

***

### onSwitchToText

> **onSwitchToText**: () => `void`

Defined in: [md-webview/toolbar.ts:8](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/toolbar.ts#L8)

標準テキストエディタ（ソース表示）への切り替え時に呼び出されます。

#### Returns

`void`

***

### onToggleOutline?

> `optional` **onToggleOutline?**: () => `boolean`

Defined in: [md-webview/toolbar.ts:22](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/toolbar.ts#L22)

見出し Index パネル表示切り替え時に呼び出され、切り替え後の状態を返します。

#### Returns

`boolean`

***

### onToggleReadOnly?

> `optional` **onToggleReadOnly?**: () => `boolean`

Defined in: [md-webview/toolbar.ts:14](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/toolbar.ts#L14)

ReadOnly モード切り替え時に呼び出され、切り替え後の状態を返します。

#### Returns

`boolean`

***

### onToggleSplitView?

> `optional` **onToggleSplitView?**: () => `boolean`

Defined in: [md-webview/toolbar.ts:18](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/toolbar.ts#L18)

左右分割表示切り替え時に呼び出され、切り替え後の状態を返します。

#### Returns

`boolean`

***

### onToggleTheme

> **onToggleTheme**: () => `"default"` \| `"slate"`

Defined in: [md-webview/toolbar.ts:10](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/toolbar.ts#L10)

テーマ（Light / Dark）切り替え時に呼び出され、切り替え後のスキーム名を返します。

#### Returns

`"default"` \| `"slate"`
