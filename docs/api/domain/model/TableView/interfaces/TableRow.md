[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/TableView](../README.md) / TableRow

# Interface: TableRow

Defined in: [domain/model/TableView.ts:34](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/TableView.ts#L34)

テーブルビュー内の1行分のデータ。

## Properties

### cells

> **cells**: `Record`\<`string`, [`TableCell`](TableCell.md)\>

Defined in: [domain/model/TableView.ts:40](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/TableView.ts#L40)

カラムキーをキーとする各セルのマップ

***

### index

> **index**: `number`

Defined in: [domain/model/TableView.ts:36](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/TableView.ts#L36)

行のインデックス（0起点）

***

### path

> **path**: [`CellPath`](../../CellPath/classes/CellPath.md)

Defined in: [domain/model/TableView.ts:38](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/TableView.ts#L38)

行のアクセスパス
