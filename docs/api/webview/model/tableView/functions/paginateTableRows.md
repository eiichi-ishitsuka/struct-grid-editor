[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/model/tableView](../README.md) / paginateTableRows

# Function: paginateTableRows()

> **paginateTableRows**(`rows`, `currentPage`, `pageSize?`): [`TablePage`](../interfaces/TablePage.md)

Defined in: [webview/model/tableView.ts:138](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/e20beb86538f08849d50b688bca0eb17506d34aa/src/webview/model/tableView.ts#L138)

現在ページを有効な範囲に補正し、ページに含める行を返す。

## Parameters

### rows

[`IndexedTableRow`](../interfaces/IndexedTableRow.md)[]

### currentPage

`number`

### pageSize?

`number` = `DEFAULT_PAGE_SIZE`

## Returns

[`TablePage`](../interfaces/TablePage.md)
