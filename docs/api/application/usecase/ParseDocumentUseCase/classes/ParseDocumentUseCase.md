[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/ParseDocumentUseCase](../README.md) / ParseDocumentUseCase

# Class: ParseDocumentUseCase

Defined in: [application/usecase/ParseDocumentUseCase.ts:28](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/ParseDocumentUseCase.ts#L28)

ソーステキストを解析し、Webview描画用のデータ構造（DTO）に変換するユースケース。

## Constructors

### Constructor

> **new ParseDocumentUseCase**(`parsers`): `ParseDocumentUseCase`

Defined in: [application/usecase/ParseDocumentUseCase.ts:29](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/ParseDocumentUseCase.ts#L29)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`ParseDocumentUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `options?`): `object`

Defined in: [application/usecase/ParseDocumentUseCase.ts:38](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/ParseDocumentUseCase.ts#L38)

ソーステキストとファイル拡張子からドキュメントを解析し、GridDataDto を生成します。

#### Parameters

##### text

`string`

ソーステキスト文字列

##### fileExtension

`string`

ファイル拡張子（例: "json", "yaml", "csv", "tsv"）

##### options?

[`DocumentParseOptions`](../../../../domain/port/IDocumentParser/interfaces/DocumentParseOptions.md)

解析オプション（CSV/TSV のヘッダー有無等）

#### Returns

`object`

生成された DTO と内部のドキュメントインスタンス

##### doc?

> `optional` **doc?**: [`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

##### dto

> **dto**: [`GridDataDto`](../../../dto/GridData/interfaces/GridDataDto.md)
