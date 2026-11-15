[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [infrastructure/parser/DelimitedDocumentParser](../README.md) / CsvDocumentParser

# Class: CsvDocumentParser

Defined in: [infrastructure/parser/DelimitedDocumentParser.ts:306](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/infrastructure/parser/DelimitedDocumentParser.ts#L306)

CSV（カンマ区切り）ドキュメントパーサー。

## Extends

- [`DelimitedDocumentParser`](DelimitedDocumentParser.md)

## Constructors

### Constructor

> **new CsvDocumentParser**(): `CsvDocumentParser`

Defined in: [infrastructure/parser/DelimitedDocumentParser.ts:307](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/infrastructure/parser/DelimitedDocumentParser.ts#L307)

#### Returns

`CsvDocumentParser`

#### Overrides

[`DelimitedDocumentParser`](DelimitedDocumentParser.md).[`constructor`](DelimitedDocumentParser.md#constructor)

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

#### Inherited from

[`DelimitedDocumentParser`](DelimitedDocumentParser.md).[`parse`](DelimitedDocumentParser.md#parse)

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

#### Inherited from

[`DelimitedDocumentParser`](DelimitedDocumentParser.md).[`serialize`](DelimitedDocumentParser.md#serialize)

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

#### Inherited from

[`DelimitedDocumentParser`](DelimitedDocumentParser.md).[`supports`](DelimitedDocumentParser.md#supports)
