[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [infrastructure/parser/JsonDocumentParser](../README.md) / JsonDocumentParser

# Class: JsonDocumentParser

Defined in: infrastructure/parser/JsonDocumentParser.ts:9

JSONドキュメントの解析およびシリアライズを担うインフラストラクチャ層のアダプター。

## Implements

- [`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)

## Constructors

### Constructor

> **new JsonDocumentParser**(`formatPreserver?`): `JsonDocumentParser`

Defined in: infrastructure/parser/JsonDocumentParser.ts:10

#### Parameters

##### formatPreserver?

[`FormatPreserver`](../../../../domain/service/FormatPreserver/classes/FormatPreserver.md) = `...`

#### Returns

`JsonDocumentParser`

## Methods

### parse()

> **parse**(`text`): [`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

Defined in: infrastructure/parser/JsonDocumentParser.ts:27

JSON 文字列を解析し、StructuredDocument ドメインモデルを生成します。

#### Parameters

##### text

`string`

解析対象の JSON 文字列

#### Returns

[`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

生成された StructuredDocument インスタンス

#### Implementation of

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md).[`parse`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md#parse)

***

### serialize()

> **serialize**(`document`): `string`

Defined in: infrastructure/parser/JsonDocumentParser.ts:41

StructuredDocument を元の書式（インデント幅や末尾改行）を保持しながら JSON 文字列にシリアライズします。

#### Parameters

##### document

[`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

シリアライズ対象の StructuredDocument

#### Returns

`string`

シリアライズされた JSON 文字列

#### Implementation of

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md).[`serialize`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md#serialize)

***

### supports()

> **supports**(`fileExtension`): `boolean`

Defined in: infrastructure/parser/JsonDocumentParser.ts:17

指定された拡張子が JSON であるかを判定します。

#### Parameters

##### fileExtension

`string`

拡張子文字列（例: "json", ".json"）

#### Returns

`boolean`

サポートしている場合は true

#### Implementation of

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md).[`supports`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md#supports)
