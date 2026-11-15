[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/hooks/useKeyboardNavigation](../README.md) / findAdjacentCell

# Function: findAdjacentCell()

> **findAdjacentCell**(`rows`, `tableView`, `current`, `direction`): [`GridCellCoordinate`](../interfaces/GridCellCoordinate.md) \| `null`

Defined in: [webview/hooks/useKeyboardNavigation.ts:15](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/webview/hooks/useKeyboardNavigation.ts#L15)

表の可視セル間で、指定方向に隣接するセルを返す。

## Parameters

### rows

[`IndexedTableRow`](../../../model/tableView/interfaces/IndexedTableRow.md)[]

### tableView

[`OrderedTableView`](../../../model/tableView/interfaces/OrderedTableView.md)

### current

[`GridCellCoordinate`](../interfaces/GridCellCoordinate.md)

### direction

[`GridNavigationDirection`](../type-aliases/GridNavigationDirection.md)

## Returns

[`GridCellCoordinate`](../interfaces/GridCellCoordinate.md) \| `null`
