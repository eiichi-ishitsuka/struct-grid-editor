[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/port/IDocumentParser](../README.md) / IDocumentParser

# Interface: IDocumentParser

Defined in: [domain/port/IDocumentParser.ts:15](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/domain/port/IDocumentParser.ts#L15)

ドキュメントパーサーおよびシリアライザー（JSON、YAML、CSV、TSVなど）のポートインターフェース。
依存性逆転の原則（DIP）に準拠します。

## Methods

### parse()

> **parse**(`text`, `options?`): [`StructuredDocument`](../../../model/StructuredDocument/classes/StructuredDocument.md)

Defined in: [domain/port/IDocumentParser.ts:22](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/domain/port/IDocumentParser.ts#L22)

ソーステキストを解析し、ドメインの StructuredDocument 集約ルートを生成します。

#### Parameters

##### text

`string`

解析対象の文字列

##### options?

[`DocumentParseOptions`](DocumentParseOptions.md)

解析オプション（任意）

#### Returns

[`StructuredDocument`](../../../model/StructuredDocument/classes/StructuredDocument.md)

解析された StructuredDocument インスタンス

***

### serialize()

> **serialize**(`document`): `string`

Defined in: [domain/port/IDocumentParser.ts:29](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/domain/port/IDocumentParser.ts#L29)

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

Defined in: [domain/port/IDocumentParser.ts:36](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/domain/port/IDocumentParser.ts#L36)

指定されたファイル拡張子（例: "json", "yaml", "yml"）を本パーサーがサポートしているかを判定します。

#### Parameters

##### fileExtension

`string`

ファイルの拡張子

#### Returns

`boolean`

サポートしている場合は true
