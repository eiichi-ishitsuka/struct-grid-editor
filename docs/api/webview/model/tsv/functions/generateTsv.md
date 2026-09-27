[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/model/tsv](../README.md) / generateTsv

# Function: generateTsv()

> **generateTsv**(`view`, `selection`, `getCellValue?`): `string`

Defined in: [webview/model/tsv.ts:22](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/model/tsv.ts#L22)

現在の選択状態と表示中の表モデルから TSV 文字列を生成する。

## Parameters

### view

[`OrderedTableView`](../../tableView/interfaces/OrderedTableView.md) \| `null`

### selection

[`GridSelection`](../../../hooks/gridUiState/type-aliases/GridSelection.md)

### getCellValue?

(`path`) => `string`

## Returns

`string`
