[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/components/SpreadsheetGrid](../README.md) / SpreadsheetGridProps

# Interface: SpreadsheetGridProps

Defined in: [webview/components/SpreadsheetGrid.tsx:17](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L17)

## Properties

### colWidths?

> `optional` **colWidths?**: `Record`\<`string`, `number`\>

Defined in: [webview/components/SpreadsheetGrid.tsx:22](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L22)

***

### onAddColumn?

> `optional` **onAddColumn?**: () => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:32](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L32)

#### Returns

`void`

***

### onAddRow?

> `optional` **onAddRow?**: () => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:33](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L33)

#### Returns

`void`

***

### onCellClick

> **onCellClick**: (`rowIndex`, `colKey`, `path`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:24](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L24)

#### Parameters

##### rowIndex

`number`

##### colKey

`string`

##### path

`string`

#### Returns

`void`

***

### onCellContextMenu?

> `optional` **onCellContextMenu?**: (`event`, `cell`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:42](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L42)

#### Parameters

##### event

`MouseEvent`\<`HTMLTableCellElement`\>

##### cell

[`GridCellCoordinate`](../../../hooks/useKeyboardNavigation/interfaces/GridCellCoordinate.md)

#### Returns

`void`

***

### onColClick

> **onColClick**: (`colKey`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:26](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L26)

#### Parameters

##### colKey

`string`

#### Returns

`void`

***

### onColContextMenu?

> `optional` **onColContextMenu?**: (`event`, `colKey`, `colIndex`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:41](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L41)

#### Parameters

##### event

`MouseEvent`\<`HTMLTableCellElement`\>

##### colKey

`string`

##### colIndex

`number`

#### Returns

`void`

***

### onCornerContextMenu?

> `optional` **onCornerContextMenu?**: (`event`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:39](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L39)

#### Parameters

##### event

`MouseEvent`\<`HTMLTableCellElement`\>

#### Returns

`void`

***

### onMoveColumn?

> `optional` **onMoveColumn?**: (`fromIndex`, `toIndex`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:34](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L34)

#### Parameters

##### fromIndex

`number`

##### toIndex

`number`

#### Returns

`void`

***

### onMoveRow?

> `optional` **onMoveRow?**: (`fromIndex`, `toIndex`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:35](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L35)

#### Parameters

##### fromIndex

`number`

##### toIndex

`number`

#### Returns

`void`

***

### onNavigateAdjacent

> **onNavigateAdjacent**: (`current`, `direction`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:30](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L30)

#### Parameters

##### current

[`GridCellCoordinate`](../../../hooks/useKeyboardNavigation/interfaces/GridCellCoordinate.md)

##### direction

[`GridNavigationDirection`](../../../hooks/useKeyboardNavigation/type-aliases/GridNavigationDirection.md)

#### Returns

`void`

***

### onNavigateArray?

> `optional` **onNavigateArray?**: (`arrayPath`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:38](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L38)

#### Parameters

##### arrayPath

`string`

#### Returns

`void`

***

### onPageChange

> **onPageChange**: (`page`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:23](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L23)

#### Parameters

##### page

`number`

#### Returns

`void`

***

### onRenameColumn?

> `optional` **onRenameColumn?**: (`oldKey`, `newKey`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:31](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L31)

#### Parameters

##### oldKey

`string`

##### newKey

`string`

#### Returns

`void`

***

### onResetColWidth?

> `optional` **onResetColWidth?**: (`colKey`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:37](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L37)

#### Parameters

##### colKey

`string`

#### Returns

`void`

***

### onResizeColumn?

> `optional` **onResizeColumn?**: (`colKey`, `width`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:36](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L36)

#### Parameters

##### colKey

`string`

##### width

`number`

#### Returns

`void`

***

### onRowClick

> **onRowClick**: (`rowIndex`, `path`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:25](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L25)

#### Parameters

##### rowIndex

`number`

##### path

`string`

#### Returns

`void`

***

### onRowContextMenu?

> `optional` **onRowContextMenu?**: (`event`, `rowIndex`, `path`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:40](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L40)

#### Parameters

##### event

`MouseEvent`\<`HTMLTableCellElement`\>

##### rowIndex

`number`

##### path

`string`

#### Returns

`void`

***

### onSelectAll

> **onSelectAll**: () => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:27](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L27)

#### Returns

`void`

***

### onSortChange

> **onSortChange**: (`colKey`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:28](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L28)

#### Parameters

##### colKey

`string`

#### Returns

`void`

***

### onUpdateCell

> **onUpdateCell**: (`path`, `value`) => `void`

Defined in: [webview/components/SpreadsheetGrid.tsx:29](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L29)

#### Parameters

##### path

`string`

##### value

`string`

#### Returns

`void`

***

### page

> **page**: [`TablePage`](../../../model/tableView/interfaces/TablePage.md)

Defined in: [webview/components/SpreadsheetGrid.tsx:19](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L19)

***

### selection

> **selection**: [`GridSelection`](../../../hooks/gridUiState/type-aliases/GridSelection.md)

Defined in: [webview/components/SpreadsheetGrid.tsx:20](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L20)

***

### sortState

> **sortState**: [`TableSortState`](../../../model/tableView/interfaces/TableSortState.md) \| `undefined`

Defined in: [webview/components/SpreadsheetGrid.tsx:21](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L21)

***

### tableView

> **tableView**: [`OrderedTableView`](../../../model/tableView/interfaces/OrderedTableView.md)

Defined in: [webview/components/SpreadsheetGrid.tsx:18](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/SpreadsheetGrid.tsx#L18)
