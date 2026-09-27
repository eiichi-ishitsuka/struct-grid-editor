[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [infrastructure/parser/JsonlDocumentParser](../README.md) / JsonlDocumentParser

# Class: JsonlDocumentParser

Defined in: [infrastructure/parser/JsonlDocumentParser.ts:11](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/infrastructure/parser/JsonlDocumentParser.ts#L11)

JSONL（JSON Lines: 改行区切りJSON）ドキュメントの解析およびシリアライズを担うパーサー。
ファイル全体をトップレベル配列としてモデル化し、スプレッドシート形式での閲覧・編集を可能にします。

## Implements

- [`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)

## Constructors

### Constructor

> **new JsonlDocumentParser**(): `JsonlDocumentParser`

#### Returns

`JsonlDocumentParser`

## Methods

### parse()

> **parse**(`text`): [`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

Defined in: [infrastructure/parser/JsonlDocumentParser.ts:28](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/infrastructure/parser/JsonlDocumentParser.ts#L28)

JSONL 文字列を各行ごとに解析し、配列をルートとする StructuredDocument ドメインモデルを生成します。
空行のスキップや JSONC コメント（//, /* ... */）の除去にも対応しています。

#### Parameters

##### text

`string`

解析対象の JSONL 文字列

#### Returns

[`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

生成された StructuredDocument インスタンス

#### Implementation of

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md).[`parse`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md#parse)

***

### serialize()

> **serialize**(`document`): `string`

Defined in: [infrastructure/parser/JsonlDocumentParser.ts:68](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/infrastructure/parser/JsonlDocumentParser.ts#L68)

StructuredDocument を1行1JSON形式（JSON Lines）の文字列にシリアライズします。

#### Parameters

##### document

[`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

シリアライズ対象の StructuredDocument

#### Returns

`string`

シリアライズされた JSONL 文字列

#### Implementation of

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md).[`serialize`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md#serialize)

***

### supports()

> **supports**(`fileExtension`): `boolean`

Defined in: [infrastructure/parser/JsonlDocumentParser.ts:17](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/infrastructure/parser/JsonlDocumentParser.ts#L17)

指定された拡張子が JSONL であるかを判定します。

#### Parameters

##### fileExtension

`string`

拡張子文字列（例: "jsonl", ".jsonl", "ndjson"）

#### Returns

`boolean`

サポートしている場合は true

#### Implementation of

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md).[`supports`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md#supports)
