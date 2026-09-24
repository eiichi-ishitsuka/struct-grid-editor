[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [infrastructure/parser/YamlDocumentParser](../README.md) / YamlDocumentParser

# Class: YamlDocumentParser

Defined in: infrastructure/parser/YamlDocumentParser.ts:12

YAMLドキュメントの解析およびシリアライズを担うインフラストラクチャ層のアダプター。
`yaml` ライブラリの AST を活用し、コメントや書式を最大限保持します。

## Implements

- [`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)

## Constructors

### Constructor

> **new YamlDocumentParser**(`formatPreserver?`): `YamlDocumentParser`

Defined in: infrastructure/parser/YamlDocumentParser.ts:13

#### Parameters

##### formatPreserver?

[`FormatPreserver`](../../../../domain/service/FormatPreserver/classes/FormatPreserver.md) = `...`

#### Returns

`YamlDocumentParser`

## Methods

### parse()

> **parse**(`text`): [`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

Defined in: infrastructure/parser/YamlDocumentParser.ts:30

YAML 文字列を解析し、StructuredDocument ドメインモデルを生成します。

#### Parameters

##### text

`string`

解析対象の YAML 文字列

#### Returns

[`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

生成された StructuredDocument インスタンス

#### Implementation of

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md).[`parse`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md#parse)

***

### serialize()

> **serialize**(`document`): `string`

Defined in: infrastructure/parser/YamlDocumentParser.ts:60

StructuredDocument をコメントやインデントを保持しながら YAML 文字列にシリアライズします。

#### Parameters

##### document

[`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

シリアライズ対象の StructuredDocument

#### Returns

`string`

シリアライズされた YAML 文字列

#### Implementation of

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md).[`serialize`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md#serialize)

***

### supports()

> **supports**(`fileExtension`): `boolean`

Defined in: infrastructure/parser/YamlDocumentParser.ts:20

指定された拡張子が YAML であるかを判定します。

#### Parameters

##### fileExtension

`string`

拡張子文字列（例: "yaml", "yml"）

#### Returns

`boolean`

サポートしている場合は true

#### Implementation of

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md).[`supports`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md#supports)
