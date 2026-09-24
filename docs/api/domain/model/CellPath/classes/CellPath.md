[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/CellPath](../README.md) / CellPath

# Class: CellPath

Defined in: domain/model/CellPath.ts:5

構造化データ内の特定セルまたはノードへのアクセスパスを表現する値オブジェクト（Value Object）。
例: "users[0].address.city", "metadata.tags[1]"

## Constructors

### Constructor

> **new CellPath**(`segments`): `CellPath`

Defined in: domain/model/CellPath.ts:9

#### Parameters

##### segments

(`string` \| `number`)[]

#### Returns

`CellPath`

## Properties

### segments

> `readonly` **segments**: readonly (`string` \| `number`)[]

Defined in: domain/model/CellPath.ts:7

パスを構成する各セグメント（プロパティ名または配列インデックス）の配列

## Accessors

### depth

#### Get Signature

> **get** **depth**(): `number`

Defined in: domain/model/CellPath.ts:60

パスの深さ（セグメント数）を取得します。

##### Returns

`number`

***

### lastSegment

#### Get Signature

> **get** **lastSegment**(): `string` \| `number` \| `undefined`

Defined in: domain/model/CellPath.ts:67

パスの末尾セグメントを取得します。

##### Returns

`string` \| `number` \| `undefined`

***

### length

#### Get Signature

> **get** **length**(): `number`

Defined in: domain/model/CellPath.ts:53

パスの長さ（セグメント数）を取得します。

##### Returns

`number`

***

### parent

#### Get Signature

> **get** **parent**(): `CellPath` \| `null`

Defined in: domain/model/CellPath.ts:74

親要素へのパスを取得します。ルート要素の場合は null を返します。

##### Returns

`CellPath` \| `null`

## Methods

### append()

> **append**(`segment`): `CellPath`

Defined in: domain/model/CellPath.ts:86

現在のパスの末尾に新しいセグメントを追加した新しい CellPath インスタンスを返します。

#### Parameters

##### segment

`string` \| `number`

追加するセグメント

#### Returns

`CellPath`

新しい CellPath インスタンス

***

### equals()

> **equals**(`other`): `boolean`

Defined in: domain/model/CellPath.ts:112

別の CellPath と等価であるかを判定します。

#### Parameters

##### other

`CellPath`

比較対象の CellPath

#### Returns

`boolean`

等価である場合は true

***

### isChildOf()

> **isChildOf**(`other`): `boolean`

Defined in: domain/model/CellPath.ts:95

指定されたパスの子要素であるかを判定します。

#### Parameters

##### other

`CellPath`

比較対象の CellPath

#### Returns

`boolean`

子要素である場合は true

***

### toString()

> **toString**(): `string`

Defined in: domain/model/CellPath.ts:123

パスを文字列表現（例: "users[0].name"）に変換します。

#### Returns

`string`

文字列表現のパス

***

### fromSegments()

> `static` **fromSegments**(`segments`): `CellPath`

Defined in: domain/model/CellPath.ts:46

セグメントの配列から CellPath インスタンスを生成します。

#### Parameters

##### segments

(`string` \| `number`)[]

セグメントの配列

#### Returns

`CellPath`

生成された CellPath インスタンス

***

### fromString()

> `static` **fromString**(`pathStr`): `CellPath`

Defined in: domain/model/CellPath.ts:18

"a.b[0].c" や "items[2]" などのパス文字列を解析して CellPath インスタンスを生成します。

#### Parameters

##### pathStr

`string`

解析対象のパス文字列

#### Returns

`CellPath`

生成された CellPath インスタンス
