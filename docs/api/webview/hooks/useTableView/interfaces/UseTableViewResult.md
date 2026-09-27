[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/hooks/useTableView](../README.md) / UseTableViewResult

# Interface: UseTableViewResult

Defined in: [webview/hooks/useTableView.ts:13](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useTableView.ts#L13)

## Properties

### activeArrayPath

> **activeArrayPath**: `string` \| `null`

Defined in: [webview/hooks/useTableView.ts:14](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useTableView.ts#L14)

***

### page

> **page**: [`TablePage`](../../../model/tableView/interfaces/TablePage.md)

Defined in: [webview/hooks/useTableView.ts:17](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useTableView.ts#L17)

***

### pathKey

> **pathKey**: `string`

Defined in: [webview/hooks/useTableView.ts:18](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useTableView.ts#L18)

***

### searchQuery

> **searchQuery**: `string`

Defined in: [webview/hooks/useTableView.ts:15](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useTableView.ts#L15)

***

### setActiveArrayPath

> **setActiveArrayPath**: (`path`) => `void`

Defined in: [webview/hooks/useTableView.ts:21](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useTableView.ts#L21)

#### Parameters

##### path

`string`

#### Returns

`void`

***

### setCurrentPage

> **setCurrentPage**: (`page`) => `void`

Defined in: [webview/hooks/useTableView.ts:22](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useTableView.ts#L22)

#### Parameters

##### page

`number`

#### Returns

`void`

***

### setHiddenColumns

> **setHiddenColumns**: (`columnKeys`) => `void`

Defined in: [webview/hooks/useTableView.ts:23](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useTableView.ts#L23)

#### Parameters

##### columnKeys

`string`[]

#### Returns

`void`

***

### setSearchQuery

> **setSearchQuery**: (`query`) => `void`

Defined in: [webview/hooks/useTableView.ts:20](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useTableView.ts#L20)

#### Parameters

##### query

`string`

#### Returns

`void`

***

### sortState

> **sortState**: [`TableSortState`](../../../model/tableView/interfaces/TableSortState.md) \| `undefined`

Defined in: [webview/hooks/useTableView.ts:19](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useTableView.ts#L19)

***

### tableView

> **tableView**: [`OrderedTableView`](../../../model/tableView/interfaces/OrderedTableView.md) \| `null`

Defined in: [webview/hooks/useTableView.ts:16](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useTableView.ts#L16)

***

### toggleSort

> **toggleSort**: (`colKey`) => `void`

Defined in: [webview/hooks/useTableView.ts:24](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useTableView.ts#L24)

#### Parameters

##### colKey

`string`

#### Returns

`void`
