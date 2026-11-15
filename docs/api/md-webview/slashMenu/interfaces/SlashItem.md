[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [md-webview/slashMenu](../README.md) / SlashItem

# Interface: SlashItem

Defined in: [md-webview/slashMenu.ts:6](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/slashMenu.ts#L6)

スラッシュコマンドメニュー（`/`）の各項目定義。

## Properties

### desc

> **desc**: `string`

Defined in: [md-webview/slashMenu.ts:12](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/slashMenu.ts#L12)

メニューに表示する補足説明

***

### icon

> **icon**: `string`

Defined in: [md-webview/slashMenu.ts:14](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/slashMenu.ts#L14)

アイコンバッジに表示する短い記号ラベル

***

### id

> **id**: `string`

Defined in: [md-webview/slashMenu.ts:8](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/slashMenu.ts#L8)

項目の識別子

***

### keywords

> **keywords**: `string`[]

Defined in: [md-webview/slashMenu.ts:16](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/slashMenu.ts#L16)

絞り込み検索用のキーワード一覧

***

### run

> **run**: (`editor`) => `void`

Defined in: [md-webview/slashMenu.ts:18](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/slashMenu.ts#L18)

項目選択時に実行されるアクション

#### Parameters

##### editor

`Editor`

#### Returns

`void`

***

### title

> **title**: `string`

Defined in: [md-webview/slashMenu.ts:10](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/md-webview/slashMenu.ts#L10)

メニューに表示するタイトル
