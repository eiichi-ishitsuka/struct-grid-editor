[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/FlatRow](../README.md) / FlatRow

# Class: FlatRow

Defined in: domain/model/FlatRow.ts:8

スプレッドシートグリッドにおける1行分のデータを表現する値オブジェクト（Value Object）。

## Constructors

### Constructor

> **new FlatRow**(`path`, `key`, `value`, `depth`, `isLeaf`, `nodeType`): `FlatRow`

Defined in: domain/model/FlatRow.ts:26

#### Parameters

##### path

[`CellPath`](../../CellPath/classes/CellPath.md)

##### key

`string` \| `number`

##### value

[`CellValue`](../../CellValue/classes/CellValue.md)

##### depth

`number`

##### isLeaf

`boolean`

##### nodeType

[`TreeNodeType`](../../TreeNode/type-aliases/TreeNodeType.md)

#### Returns

`FlatRow`

## Properties

### depth

> `readonly` **depth**: `number`

Defined in: domain/model/FlatRow.ts:20

階層の深さ（0起点）

***

### displayPath

> `readonly` **displayPath**: `string`

Defined in: domain/model/FlatRow.ts:16

グリッドに表示するためのパス文字列（例: "users[0].name"）

***

### id

> `readonly` **id**: `string`

Defined in: domain/model/FlatRow.ts:10

行の一意識別子

***

### isLeaf

> `readonly` **isLeaf**: `boolean`

Defined in: domain/model/FlatRow.ts:22

リーフ（末端の値）であるかどうか

***

### key

> `readonly` **key**: `string` \| `number`

Defined in: domain/model/FlatRow.ts:14

プロパティ名または配列インデックス

***

### nodeType

> `readonly` **nodeType**: [`TreeNodeType`](../../TreeNode/type-aliases/TreeNodeType.md)

Defined in: domain/model/FlatRow.ts:24

ノードの種類 ('object' | 'array' | 'primitive')

***

### path

> `readonly` **path**: [`CellPath`](../../CellPath/classes/CellPath.md)

Defined in: domain/model/FlatRow.ts:12

ルートからの絶対アクセスパス

***

### value

> `readonly` **value**: [`CellValue`](../../CellValue/classes/CellValue.md)

Defined in: domain/model/FlatRow.ts:18

セルの値
