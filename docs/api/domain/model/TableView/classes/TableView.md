[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/TableView](../README.md) / TableView

# Class: TableView

Defined in: domain/model/TableView.ts:46

配列データを2次元のスプレッドシート／テーブル形式として表現するドメインモデル。

## Constructors

### Constructor

> **new TableView**(`path`, `columns`, `rows`, `isObjectArray`): `TableView`

Defined in: domain/model/TableView.ts:56

#### Parameters

##### path

[`CellPath`](../../CellPath/classes/CellPath.md)

##### columns

[`TableColumn`](../interfaces/TableColumn.md)[]

##### rows

[`TableRow`](../interfaces/TableRow.md)[]

##### isObjectArray

`boolean`

#### Returns

`TableView`

## Properties

### columns

> `readonly` **columns**: readonly [`TableColumn`](../interfaces/TableColumn.md)[]

Defined in: domain/model/TableView.ts:50

カラム一覧

***

### isObjectArray

> `readonly` **isObjectArray**: `boolean`

Defined in: domain/model/TableView.ts:54

オブジェクト配列であるか（false の場合はプリミティブ配列）

***

### path

> `readonly` **path**: [`CellPath`](../../CellPath/classes/CellPath.md)

Defined in: domain/model/TableView.ts:48

テーブルの基点となる配列のパス

***

### rows

> `readonly` **rows**: readonly [`TableRow`](../interfaces/TableRow.md)[]

Defined in: domain/model/TableView.ts:52

行データ一覧

## Accessors

### totalColumns

#### Get Signature

> **get** **totalColumns**(): `number`

Defined in: domain/model/TableView.ts:78

総カラム数を取得します。

##### Returns

`number`

***

### totalRows

#### Get Signature

> **get** **totalRows**(): `number`

Defined in: domain/model/TableView.ts:71

総行数を取得します。

##### Returns

`number`

## Methods

### detectColumnType()

> `static` **detectColumnType**(`sampleNodes`): `"string"` \| `"number"` \| `"boolean"` \| `"object"` \| `"array"` \| `"other"`

Defined in: domain/model/TableView.ts:240

サンプルノード群からカラム全体のデータ型を推定します。

#### Parameters

##### sampleNodes

[`TreeNode`](../../TreeNode/classes/TreeNode.md)[]

サンプルノードのリスト

#### Returns

`"string"` \| `"number"` \| `"boolean"` \| `"object"` \| `"array"` \| `"other"`

推定されたカラムデータ型

***

### fromArrayNode()

> `static` **fromArrayNode**(`node`): `TableView`

Defined in: domain/model/TableView.ts:87

配列を表す TreeNode から TableView インスタンスを構築します。

#### Parameters

##### node

[`TreeNode`](../../TreeNode/classes/TreeNode.md)

配列型の TreeNode

#### Returns

`TableView`

構築された TableView インスタンス

***

### getTypeSymbol()

> `static` **getTypeSymbol**(`type`): `string`

Defined in: domain/model/TableView.ts:225

データ型に応じた表示用シンボル文字を取得します。

#### Parameters

##### type

`"string"` \| `"number"` \| `"boolean"` \| `"object"` \| `"array"` \| `"other"`

カラムのデータ型

#### Returns

`string`

表示シンボル文字列
