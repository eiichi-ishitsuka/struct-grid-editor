[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/model/tableView](../README.md) / getActiveTableView

# Function: getActiveTableView()

> **getActiveTableView**(`data`, `activeArrayPath`): [`TableViewDto`](../../../../application/dto/GridData/interfaces/TableViewDto.md) \| `null`

Defined in: [webview/model/tableView.ts:42](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/model/tableView.ts#L42)

指定パスに対応するテーブルを取得する。null は KV 表示中を表す。

## Parameters

### data

[`GridDataDto`](../../../../application/dto/GridData/interfaces/GridDataDto.md)

### activeArrayPath

`string` \| `null`

## Returns

[`TableViewDto`](../../../../application/dto/GridData/interfaces/TableViewDto.md) \| `null`
