[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [infrastructure/webview/WebviewRenderer](../README.md) / WebviewRenderer

# Class: WebviewRenderer

Defined in: infrastructure/webview/WebviewRenderer.ts:6

GridDataDto を元にスプレッドシート・グリッドUIの完全な HTML 文字列を生成するレンダラー。

## Constructors

### Constructor

> **new WebviewRenderer**(): `WebviewRenderer`

#### Returns

`WebviewRenderer`

## Methods

### render()

> **render**(`data`): `string`

Defined in: infrastructure/webview/WebviewRenderer.ts:12

グリッドデータ DTO から VS Code Webview 用の HTML 文字列を生成します。

#### Parameters

##### data

[`GridDataDto`](../../../../application/dto/GridData/interfaces/GridDataDto.md)

描画対象の GridDataDto

#### Returns

`string`

生成された HTML 文字列
