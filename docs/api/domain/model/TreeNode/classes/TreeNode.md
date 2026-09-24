[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/TreeNode](../README.md) / TreeNode

# Class: TreeNode

Defined in: domain/model/TreeNode.ts:13

構造化ドキュメントのツリーを構成する各ノード。
キーの出現順序と階層構造を正確に保持します。

## Constructors

### Constructor

> **new TreeNode**(`path`, `key`, `type`, `value?`, `children?`): `TreeNode`

Defined in: domain/model/TreeNode.ts:25

#### Parameters

##### path

[`CellPath`](../../CellPath/classes/CellPath.md)

##### key

`string` \| `number`

##### type

[`TreeNodeType`](../type-aliases/TreeNodeType.md)

##### value?

[`CellValue`](../../CellValue/classes/CellValue.md)

##### children?

`TreeNode`[] = `[]`

#### Returns

`TreeNode`

## Properties

### children

> `readonly` **children**: readonly `TreeNode`[]

Defined in: domain/model/TreeNode.ts:23

子ノードのリスト（オブジェクトまたは配列の場合）

***

### key

> `readonly` **key**: `string` \| `number`

Defined in: domain/model/TreeNode.ts:17

ノードのプロパティ名または配列インデックス

***

### path

> `readonly` **path**: [`CellPath`](../../CellPath/classes/CellPath.md)

Defined in: domain/model/TreeNode.ts:15

ルートからの絶対アクセスパス

***

### type

> `readonly` **type**: [`TreeNodeType`](../type-aliases/TreeNodeType.md)

Defined in: domain/model/TreeNode.ts:19

ノードの種類 ('object' | 'array' | 'primitive')

***

### value?

> `readonly` `optional` **value?**: [`CellValue`](../../CellValue/classes/CellValue.md)

Defined in: domain/model/TreeNode.ts:21

プリミティブノードの場合の値

## Accessors

### isLeaf

#### Get Signature

> **get** **isLeaf**(): `boolean`

Defined in: domain/model/TreeNode.ts:75

ノードが末端（プリミティブ値）であるかを判定します。

##### Returns

`boolean`

## Methods

### toJS()

> **toJS**(): `any`

Defined in: domain/model/TreeNode.ts:83

TreeNode 階層を標準的な JavaScript のオブジェクト・配列・プリミティブ値に変換します。

#### Returns

`any`

変換後の JavaScript データ

***

### withUpdatedValue()

> **withUpdatedValue**(`targetPath`, `newValue`): `TreeNode`

Defined in: domain/model/TreeNode.ts:103

指定されたパスの値を更新した新しい TreeNode インスタンスを生成して返します（イミュータブル更新）。

#### Parameters

##### targetPath

[`CellPath`](../../CellPath/classes/CellPath.md)

更新対象のノードへのパス

##### newValue

[`CellValue`](../../CellValue/classes/CellValue.md)

新しいセル値

#### Returns

`TreeNode`

更新後の新しい TreeNode インスタンス

***

### array()

> `static` **array**(`path`, `key`, `children?`): `TreeNode`

Defined in: domain/model/TreeNode.ts:68

配列を表すノードを生成します。

#### Parameters

##### path

[`CellPath`](../../CellPath/classes/CellPath.md)

ノードへのアクセスパス

##### key

`string` \| `number`

キー名またはインデックス

##### children?

`TreeNode`[] = `[]`

配列要素を表す子ノードの配列

#### Returns

`TreeNode`

生成された TreeNode インスタンス

***

### fromJS()

> `static` **fromJS**(`data`, `path?`, `key?`): `TreeNode`

Defined in: domain/model/TreeNode.ts:129

標準的な JavaScript データから TreeNode 構文木を再帰的に構築します。

#### Parameters

##### data

`any`

変換対象のデータ

##### path?

[`CellPath`](../../CellPath/classes/CellPath.md) = `...`

カレントパス（省略時はルート）

##### key?

`string` \| `number`

カレントキー（省略時は空文字）

#### Returns

`TreeNode`

構築された TreeNode ルートノード

***

### object()

> `static` **object**(`path`, `key`, `children?`): `TreeNode`

Defined in: domain/model/TreeNode.ts:57

オブジェクト（辞書構造）を表すノードを生成します。

#### Parameters

##### path

[`CellPath`](../../CellPath/classes/CellPath.md)

ノードへのアクセスパス

##### key

`string` \| `number`

キー名またはインデックス

##### children?

`TreeNode`[] = `[]`

子ノードの配列

#### Returns

`TreeNode`

生成された TreeNode インスタンス

***

### primitive()

> `static` **primitive**(`path`, `key`, `value`): `TreeNode`

Defined in: domain/model/TreeNode.ts:46

プリミティブ値（文字列、数値、真偽値等）を表すノードを生成します。

#### Parameters

##### path

[`CellPath`](../../CellPath/classes/CellPath.md)

ノードへのアクセスパス

##### key

`string` \| `number`

キー名またはインデックス

##### value

[`CellValue`](../../CellValue/classes/CellValue.md)

セル値

#### Returns

`TreeNode`

生成された TreeNode インスタンス
