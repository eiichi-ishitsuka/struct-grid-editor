[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/model/tableView](../README.md) / getOrderedTableView

# Function: getOrderedTableView()

> **getOrderedTableView**(`data`, `activeArrayPath`, `preferences`): [`OrderedTableView`](../interfaces/OrderedTableView.md) \| `null`

Defined in: [webview/model/tableView.ts:62](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/model/tableView.ts#L62)

テーブルを表示用に変換する。列・行の並び替え、非表示列、ソートを反映するが、
入力 DTO と設定は変更しない。

## Parameters

### data

[`GridDataDto`](../../../../application/dto/GridData/interfaces/GridDataDto.md)

### activeArrayPath

`string` \| `null`

### preferences

[`TableViewPreferences`](../interfaces/TableViewPreferences.md)

## Returns

[`OrderedTableView`](../interfaces/OrderedTableView.md) \| `null`
