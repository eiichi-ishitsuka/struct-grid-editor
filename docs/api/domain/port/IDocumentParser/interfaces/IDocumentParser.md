[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/port/IDocumentParser](../README.md) / IDocumentParser

# Interface: IDocumentParser

Defined in: [domain/port/IDocumentParser.ts:7](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/port/IDocumentParser.ts#L7)

ドキュメントパーサーおよびシリアライザー（JSON、YAMLなど）のポートインターフェース。
依存性逆転の原則（DIP）に準拠します。

## Methods

### parse()

> **parse**(`text`): [`StructuredDocument`](../../../model/StructuredDocument/classes/StructuredDocument.md)

Defined in: [domain/port/IDocumentParser.ts:13](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/port/IDocumentParser.ts#L13)

ソーステキストを解析し、ドメインの StructuredDocument 集約ルートを生成します。

#### Parameters

##### text

`string`

解析対象の文字列

#### Returns

[`StructuredDocument`](../../../model/StructuredDocument/classes/StructuredDocument.md)

解析された StructuredDocument インスタンス

***

### serialize()

> **serialize**(`document`): `string`

Defined in: [domain/port/IDocumentParser.ts:20](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/port/IDocumentParser.ts#L20)

ドメインの StructuredDocument を、書式やコメントを保持しながらテキスト形式にシリアライズします。

#### Parameters

##### document

[`StructuredDocument`](../../../model/StructuredDocument/classes/StructuredDocument.md)

シリアライズ対象の StructuredDocument

#### Returns

`string`

シリアライズされた文字列

***

### supports()

> **supports**(`fileExtension`): `boolean`

Defined in: [domain/port/IDocumentParser.ts:27](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/port/IDocumentParser.ts#L27)

指定されたファイル拡張子（例: "json", "yaml", "yml"）を本パーサーがサポートしているかを判定します。

#### Parameters

##### fileExtension

`string`

ファイルの拡張子

#### Returns

`boolean`

サポートしている場合は true
