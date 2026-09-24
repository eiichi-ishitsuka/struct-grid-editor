[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/service/TreeFlattener](../README.md) / TreeFlattener

# Class: TreeFlattener

Defined in: domain/service/TreeFlattener.ts:25

階層構造を持つ TreeNode とフラットな FlatRow 配列との相互変換を行うドメインサービス。

## Constructors

### Constructor

> **new TreeFlattener**(): `TreeFlattener`

#### Returns

`TreeFlattener`

## Methods

### flatten()

> **flatten**(`root`, `options?`): [`FlatRow`](../../../model/FlatRow/classes/FlatRow.md)[]

Defined in: domain/service/TreeFlattener.ts:32

TreeNode 構文木を再帰的に走査し、グリッド描画用の FlatRow 配列に平坦化します。

#### Parameters

##### root

[`TreeNode`](../../../model/TreeNode/classes/TreeNode.md)

ルート TreeNode

##### options?

[`FlattenOptions`](../interfaces/FlattenOptions.md) = `{}`

平坦化オプション

#### Returns

[`FlatRow`](../../../model/FlatRow/classes/FlatRow.md)[]

平坦化された FlatRow の配列

***

### unflatten()

> **unflatten**(`rows`): `any`

Defined in: domain/service/TreeFlattener.ts:89

フラットなパス・値ペアのリストから、ネストされた JavaScript データ構造を再構築します。

#### Parameters

##### rows

`object`[]

パスと値を持つ行データの配列

#### Returns

`any`

再構築された JavaScript データ構造
