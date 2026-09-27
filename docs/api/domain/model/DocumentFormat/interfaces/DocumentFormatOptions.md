[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/DocumentFormat](../README.md) / DocumentFormatOptions

# Interface: DocumentFormatOptions

Defined in: [domain/model/DocumentFormat.ts:9](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/DocumentFormat.ts#L9)

ドキュメントの書式オプション。

## Properties

### fileType

> **fileType**: [`DocumentFileType`](../type-aliases/DocumentFileType.md)

Defined in: [domain/model/DocumentFormat.ts:11](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/DocumentFormat.ts#L11)

ファイル形式 ('json', 'yaml' または 'jsonl')

***

### hasTrailingNewline

> **hasTrailingNewline**: `boolean`

Defined in: [domain/model/DocumentFormat.ts:15](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/DocumentFormat.ts#L15)

末尾改行が存在するかどうか

***

### indent

> **indent**: `string` \| `number`

Defined in: [domain/model/DocumentFormat.ts:13](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/DocumentFormat.ts#L13)

インデント幅またはインデント文字列

***

### metadata?

> `optional` **metadata?**: `Record`\<`string`, `any`\>

Defined in: [domain/model/DocumentFormat.ts:17](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/DocumentFormat.ts#L17)

各フォーマット固有の追加メタデータ
