[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [md-webview/slashMenu](../README.md) / SlashItem

# Interface: SlashItem

Defined in: md-webview/slashMenu.ts:6

スラッシュコマンドメニュー（`/`）の各項目定義。

## Properties

### desc

> **desc**: `string`

Defined in: md-webview/slashMenu.ts:12

メニューに表示する補足説明

***

### icon

> **icon**: `string`

Defined in: md-webview/slashMenu.ts:14

アイコンバッジに表示する短い記号ラベル

***

### id

> **id**: `string`

Defined in: md-webview/slashMenu.ts:8

項目の識別子

***

### keywords

> **keywords**: `string`[]

Defined in: md-webview/slashMenu.ts:16

絞り込み検索用のキーワード一覧

***

### run

> **run**: (`editor`) => `void`

Defined in: md-webview/slashMenu.ts:18

項目選択時に実行されるアクション

#### Parameters

##### editor

`Editor`

#### Returns

`void`

***

### title

> **title**: `string`

Defined in: md-webview/slashMenu.ts:10

メニューに表示するタイトル
