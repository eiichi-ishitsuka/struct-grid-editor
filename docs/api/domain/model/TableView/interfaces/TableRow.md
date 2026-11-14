[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/TableView](../README.md) / TableRow

# Interface: TableRow

Defined in: [domain/model/TableView.ts:34](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/e20beb86538f08849d50b688bca0eb17506d34aa/src/domain/model/TableView.ts#L34)

テーブルビュー内の1行分のデータ。

## Properties

### cells

> **cells**: `Record`\<`string`, [`TableCell`](TableCell.md)\>

Defined in: [domain/model/TableView.ts:40](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/e20beb86538f08849d50b688bca0eb17506d34aa/src/domain/model/TableView.ts#L40)

カラムキーをキーとする各セルのマップ

***

### index

> **index**: `number`

Defined in: [domain/model/TableView.ts:36](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/e20beb86538f08849d50b688bca0eb17506d34aa/src/domain/model/TableView.ts#L36)

行のインデックス（0起点）

***

### path

> **path**: [`CellPath`](../../CellPath/classes/CellPath.md)

Defined in: [domain/model/TableView.ts:38](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/e20beb86538f08849d50b688bca0eb17506d34aa/src/domain/model/TableView.ts#L38)

行のアクセスパス
