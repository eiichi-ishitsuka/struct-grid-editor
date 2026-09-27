[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/hooks/gridUiState](../README.md) / GridUiState

# Interface: GridUiState

Defined in: [webview/hooks/gridUiState.ts:17](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/gridUiState.ts#L17)

既存 Webview state と互換性のある、React 側の永続 UI state。

## Extends

- [`TableViewPreferences`](../../../model/tableView/interfaces/TableViewPreferences.md)

## Properties

### currentPage

> **currentPage**: `number`

Defined in: [webview/hooks/gridUiState.ts:19](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/gridUiState.ts#L19)

***

### customColOrders

> **customColOrders**: `Record`\<`string`, `string`[]\>

Defined in: [webview/model/tableView.ts:15](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/model/tableView.ts#L15)

#### Inherited from

[`TableViewPreferences`](../../../model/tableView/interfaces/TableViewPreferences.md).[`customColOrders`](../../../model/tableView/interfaces/TableViewPreferences.md#customcolorders)

***

### customColWidths

> **customColWidths**: `Record`\<`string`, `Record`\<`string`, `number`\>\>

Defined in: [webview/hooks/gridUiState.ts:18](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/gridUiState.ts#L18)

***

### customRowOrders

> **customRowOrders**: `Record`\<`string`, `string`[]\>

Defined in: [webview/model/tableView.ts:16](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/model/tableView.ts#L16)

#### Inherited from

[`TableViewPreferences`](../../../model/tableView/interfaces/TableViewPreferences.md).[`customRowOrders`](../../../model/tableView/interfaces/TableViewPreferences.md#customroworders)

***

### hiddenCols

> **hiddenCols**: `Record`\<`string`, `string`[]\>

Defined in: [webview/model/tableView.ts:17](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/model/tableView.ts#L17)

#### Inherited from

[`TableViewPreferences`](../../../model/tableView/interfaces/TableViewPreferences.md).[`hiddenCols`](../../../model/tableView/interfaces/TableViewPreferences.md#hiddencols)

***

### pendingFocus?

> `optional` **pendingFocus?**: [`PendingFocus`](PendingFocus.md)

Defined in: [webview/hooks/gridUiState.ts:20](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/gridUiState.ts#L20)

***

### sortState

> **sortState**: `Record`\<`string`, [`TableSortState`](../../../model/tableView/interfaces/TableSortState.md) \| `undefined`\>

Defined in: [webview/model/tableView.ts:18](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/model/tableView.ts#L18)

#### Inherited from

[`TableViewPreferences`](../../../model/tableView/interfaces/TableViewPreferences.md).[`sortState`](../../../model/tableView/interfaces/TableViewPreferences.md#sortstate)
