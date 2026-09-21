[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/DocumentFormat](../README.md) / DocumentFormatOptions

# Interface: DocumentFormatOptions

Defined in: domain/model/DocumentFormat.ts:9

ドキュメントの書式オプション。

## Properties

### fileType

> **fileType**: [`DocumentFileType`](../type-aliases/DocumentFileType.md)

Defined in: domain/model/DocumentFormat.ts:11

ファイル形式 ('json' または 'yaml')

***

### hasTrailingNewline

> **hasTrailingNewline**: `boolean`

Defined in: domain/model/DocumentFormat.ts:15

末尾改行が存在するかどうか

***

### indent

> **indent**: `string` \| `number`

Defined in: domain/model/DocumentFormat.ts:13

インデント幅またはインデント文字列

***

### metadata?

> `optional` **metadata?**: `Record`\<`string`, `any`\>

Defined in: domain/model/DocumentFormat.ts:17

各フォーマット固有の追加メタデータ
