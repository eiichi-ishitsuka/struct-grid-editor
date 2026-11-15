[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [infrastructure/vscode/WebviewRenderer](../README.md) / WebviewRenderer

# Class: WebviewRenderer

Defined in: [infrastructure/vscode/WebviewRenderer.ts:15](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/infrastructure/vscode/WebviewRenderer.ts#L15)

GridDataDto を受け取り、React UI をホストする安全な HTML shell を生成するレンダラー。
UI の描画・状態管理・イベント処理は React アプリケーション (main.js) が担当する。

## Constructors

### Constructor

> **new WebviewRenderer**(): `WebviewRenderer`

#### Returns

`WebviewRenderer`

## Methods

### render()

> **render**(`data`, `assets`): `string`

Defined in: [infrastructure/vscode/WebviewRenderer.ts:22](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/infrastructure/vscode/WebviewRenderer.ts#L22)

グリッドデータ DTO から VS Code Webview 用の HTML shell 文字列を生成します。

#### Parameters

##### data

[`GridDataDto`](../../../../application/dto/GridData/interfaces/GridDataDto.md)

描画対象の GridDataDto

##### assets

[`WebviewAssets`](../interfaces/WebviewAssets.md)

Webview で読み込む静的アセット情報

#### Returns

`string`

生成された HTML 文字列
