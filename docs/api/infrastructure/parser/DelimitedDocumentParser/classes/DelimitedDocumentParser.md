[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [infrastructure/parser/DelimitedDocumentParser](../README.md) / DelimitedDocumentParser

# Class: DelimitedDocumentParser

Defined in: [infrastructure/parser/DelimitedDocumentParser.ts:16](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/infrastructure/parser/DelimitedDocumentParser.ts#L16)

CSV / TSV（区切り文字形式）ドキュメントの解析およびシリアライズを担う汎用パーサー。
RFC 4180 に準拠し、ダブルクォート囲み・エスケープ（""）・セル内改行・区切り文字を適切に処理します。
また、1行目をヘッダーとして扱うモード（hasHeader: true）と、すべてデータ行として扱うモード（hasHeader: false）の両方をサポートします。

## Extended by

- [`CsvDocumentParser`](CsvDocumentParser.md)
- [`TsvDocumentParser`](TsvDocumentParser.md)

## Implements

- [`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)

## Constructors

### Constructor

> **new DelimitedDocumentParser**(`fileType`, `delimiter`): `DelimitedDocumentParser`

Defined in: [infrastructure/parser/DelimitedDocumentParser.ts:17](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/infrastructure/parser/DelimitedDocumentParser.ts#L17)

#### Parameters

##### fileType

`"csv"` \| `"tsv"`

##### delimiter

`","` \| "\t"

#### Returns

`DelimitedDocumentParser`

## Methods

### parse()

> **parse**(`text`, `options?`): [`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

Defined in: [infrastructure/parser/DelimitedDocumentParser.ts:38](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/infrastructure/parser/DelimitedDocumentParser.ts#L38)

区切り文字形式のテキストを解析し、オブジェクト配列をルートとする StructuredDocument を生成します。

#### Parameters

##### text

`string`

解析対象のテキスト

##### options?

[`DocumentParseOptions`](../../../../domain/port/IDocumentParser/interfaces/DocumentParseOptions.md)

解析オプション（hasHeader: 1行目をヘッダーとして扱うか）

#### Returns

[`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

生成された StructuredDocument インスタンス

#### Implementation of

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md).[`parse`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md#parse)

***

### serialize()

> **serialize**(`document`): `string`

Defined in: [infrastructure/parser/DelimitedDocumentParser.ts:105](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/infrastructure/parser/DelimitedDocumentParser.ts#L105)

StructuredDocument を CSV または TSV 形式の文字列にシリアライズします。

#### Parameters

##### document

[`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

シリアライズ対象の StructuredDocument

#### Returns

`string`

シリアライズされた文字列

#### Implementation of

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md).[`serialize`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md#serialize)

***

### supports()

> **supports**(`fileExtension`): `boolean`

Defined in: [infrastructure/parser/DelimitedDocumentParser.ts:27](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/infrastructure/parser/DelimitedDocumentParser.ts#L27)

指定された拡張子が本パーサーの対象（csv または tsv）であるかを判定します。

#### Parameters

##### fileExtension

`string`

拡張子文字列

#### Returns

`boolean`

サポートしている場合は true

#### Implementation of

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md).[`supports`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md#supports)
