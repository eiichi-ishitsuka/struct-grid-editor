[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/CellValue](../README.md) / CellValue

# Class: CellValue

Defined in: [domain/model/CellValue.ts:9](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/CellValue.ts#L9)

型情報を保持するセル値を表現する値オブジェクト（Value Object）。

## Constructors

### Constructor

> **new CellValue**(`value`, `type?`): `CellValue`

Defined in: [domain/model/CellValue.ts:15](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/CellValue.ts#L15)

#### Parameters

##### value

`any`

##### type?

[`CellValueType`](../type-aliases/CellValueType.md)

#### Returns

`CellValue`

## Properties

### type

> `readonly` **type**: [`CellValueType`](../type-aliases/CellValueType.md)

Defined in: [domain/model/CellValue.ts:13](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/CellValue.ts#L13)

判定・指定されたデータ型

***

### value

> `readonly` **value**: `any`

Defined in: [domain/model/CellValue.ts:11](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/CellValue.ts#L11)

実際の生データ値

## Methods

### equals()

> **equals**(`other`): `boolean`

Defined in: [domain/model/CellValue.ts:106](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/CellValue.ts#L106)

別の CellValue と型および値が等価であるかを判定します。

#### Parameters

##### other

`CellValue`

比較対象の CellValue

#### Returns

`boolean`

等価である場合は true

***

### toDisplayString()

> **toDisplayString**(): `string`

Defined in: [domain/model/CellValue.ts:91](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/CellValue.ts#L91)

グリッドUI上に表示するための文字列形式に変換します。

#### Returns

`string`

表示用文字列

***

### detectType()

> `static` **detectType**(`value`): [`CellValueType`](../type-aliases/CellValueType.md)

Defined in: [domain/model/CellValue.ts:25](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/CellValue.ts#L25)

与えられた値の型を自動判別します。

#### Parameters

##### value

`any`

判定対象の値

#### Returns

[`CellValueType`](../type-aliases/CellValueType.md)

判別された CellValueType

***

### fromInputString()

> `static` **fromInputString**(`input`, `originalType?`): `CellValue`

Defined in: [domain/model/CellValue.ts:51](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/CellValue.ts#L51)

ユーザーが入力した文字列から、型を推定して CellValue を生成します。
元の型ヒントが指定されている場合は可能な限り尊重します。

#### Parameters

##### input

`string`

ユーザー入力文字列

##### originalType?

[`CellValueType`](../type-aliases/CellValueType.md)

元のデータ型（任意）

#### Returns

`CellValue`

型付けされた CellValue インスタンス
