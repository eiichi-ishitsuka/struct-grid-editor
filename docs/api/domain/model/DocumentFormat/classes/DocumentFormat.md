[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/DocumentFormat](../README.md) / DocumentFormat

# Class: DocumentFormat

Defined in: [domain/model/DocumentFormat.ts:24](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/DocumentFormat.ts#L24)

ドキュメントの書式特性をカプセル化する値オブジェクト（Value Object）。
編集時にも元のインデントや改行などの書式を保持するために使用されます。

## Constructors

### Constructor

> **new DocumentFormat**(`options`): `DocumentFormat`

Defined in: [domain/model/DocumentFormat.ts:34](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/DocumentFormat.ts#L34)

#### Parameters

##### options

[`DocumentFormatOptions`](../interfaces/DocumentFormatOptions.md)

#### Returns

`DocumentFormat`

## Properties

### fileType

> `readonly` **fileType**: [`DocumentFileType`](../type-aliases/DocumentFileType.md)

Defined in: [domain/model/DocumentFormat.ts:26](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/DocumentFormat.ts#L26)

ファイル形式

***

### hasTrailingNewline

> `readonly` **hasTrailingNewline**: `boolean`

Defined in: [domain/model/DocumentFormat.ts:30](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/DocumentFormat.ts#L30)

末尾改行が存在するかどうか

***

### indent

> `readonly` **indent**: `string` \| `number`

Defined in: [domain/model/DocumentFormat.ts:28](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/DocumentFormat.ts#L28)

インデント幅またはインデント文字列

***

### metadata

> `readonly` **metadata**: `Readonly`\<`Record`\<`string`, `any`\>\>

Defined in: [domain/model/DocumentFormat.ts:32](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/DocumentFormat.ts#L32)

各フォーマット固有の追加メタデータ

## Methods

### defaultCsv()

> `static` **defaultCsv**(): `DocumentFormat`

Defined in: [domain/model/DocumentFormat.ts:81](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/DocumentFormat.ts#L81)

デフォルトのCSV書式を生成します。

#### Returns

`DocumentFormat`

デフォルトCSV書式

***

### defaultJson()

> `static` **defaultJson**(): `DocumentFormat`

Defined in: [domain/model/DocumentFormat.ts:45](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/DocumentFormat.ts#L45)

デフォルトのJSON書式を生成します。

#### Returns

`DocumentFormat`

デフォルトJSON書式

***

### defaultJsonl()

> `static` **defaultJsonl**(): `DocumentFormat`

Defined in: [domain/model/DocumentFormat.ts:69](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/DocumentFormat.ts#L69)

デフォルトのJSONL書式を生成します。

#### Returns

`DocumentFormat`

デフォルトJSONL書式

***

### defaultTsv()

> `static` **defaultTsv**(): `DocumentFormat`

Defined in: [domain/model/DocumentFormat.ts:98](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/DocumentFormat.ts#L98)

デフォルトのTSV書式を生成します。

#### Returns

`DocumentFormat`

デフォルトTSV書式

***

### defaultYaml()

> `static` **defaultYaml**(): `DocumentFormat`

Defined in: [domain/model/DocumentFormat.ts:57](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/domain/model/DocumentFormat.ts#L57)

デフォルトのYAML書式を生成します。

#### Returns

`DocumentFormat`

デフォルトYAML書式
