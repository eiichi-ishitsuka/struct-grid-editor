[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/DocumentFormat](../README.md) / DocumentFormat

# Class: DocumentFormat

Defined in: domain/model/DocumentFormat.ts:24

ドキュメントの書式特性をカプセル化する値オブジェクト（Value Object）。
編集時にも元のインデントや改行などの書式を保持するために使用されます。

## Constructors

### Constructor

> **new DocumentFormat**(`options`): `DocumentFormat`

Defined in: domain/model/DocumentFormat.ts:34

#### Parameters

##### options

[`DocumentFormatOptions`](../interfaces/DocumentFormatOptions.md)

#### Returns

`DocumentFormat`

## Properties

### fileType

> `readonly` **fileType**: [`DocumentFileType`](../type-aliases/DocumentFileType.md)

Defined in: domain/model/DocumentFormat.ts:26

ファイル形式

***

### hasTrailingNewline

> `readonly` **hasTrailingNewline**: `boolean`

Defined in: domain/model/DocumentFormat.ts:30

末尾改行が存在するかどうか

***

### indent

> `readonly` **indent**: `string` \| `number`

Defined in: domain/model/DocumentFormat.ts:28

インデント幅またはインデント文字列

***

### metadata

> `readonly` **metadata**: `Readonly`\<`Record`\<`string`, `any`\>\>

Defined in: domain/model/DocumentFormat.ts:32

各フォーマット固有の追加メタデータ

## Methods

### defaultJson()

> `static` **defaultJson**(): `DocumentFormat`

Defined in: domain/model/DocumentFormat.ts:45

デフォルトのJSON書式を生成します。

#### Returns

`DocumentFormat`

デフォルトJSON書式

***

### defaultYaml()

> `static` **defaultYaml**(): `DocumentFormat`

Defined in: domain/model/DocumentFormat.ts:57

デフォルトのYAML書式を生成します。

#### Returns

`DocumentFormat`

デフォルトYAML書式
