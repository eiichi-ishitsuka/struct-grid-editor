[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/model/tableView](../README.md) / filterTableRows

# Function: filterTableRows()

> **filterTableRows**(`rows`, `searchQuery`): [`IndexedTableRow`](../interfaces/IndexedTableRow.md)[]

Defined in: [webview/model/tableView.ts:120](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/model/tableView.ts#L120)

検索語を含む行だけを残し、表示上の行番号を付与する。

## Parameters

### rows

[`TableRowDto`](../../../../application/dto/GridData/interfaces/TableRowDto.md)[]

### searchQuery

`string`

## Returns

[`IndexedTableRow`](../interfaces/IndexedTableRow.md)[]
