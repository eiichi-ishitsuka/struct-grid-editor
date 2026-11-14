[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [md-webview/slashMenu](../README.md) / setupSlashMenu

# Function: setupSlashMenu()

> **setupSlashMenu**(`menuEl`, `editor`, `onPickImage`, `onToggleFrontmatter?`): `void`

Defined in: [md-webview/slashMenu.ts:28](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/md-webview/slashMenu.ts#L28)

エディタ内で `/` を入力した際にポップアップ表示されるスラッシュコマンドメニューを初期化します。

## Parameters

### menuEl

`HTMLElement`

スラッシュメニューのコンテナ DOM 要素

### editor

`Editor`

対象の Tiptap Editor インスタンス

### onPickImage

() => `void`

画像挿入選択時に呼び出されるコールバック

### onToggleFrontmatter?

() => `void`

YAML Frontmatter 欄の追加・表示切り替えコールバック

## Returns

`void`
