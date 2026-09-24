[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/ParseDocumentUseCase](../README.md) / ParseDocumentUseCase

# Class: ParseDocumentUseCase

Defined in: application/usecase/ParseDocumentUseCase.ts:10

ソーステキストを解析し、Webview描画用のデータ構造（DTO）に変換するユースケース。

## Constructors

### Constructor

> **new ParseDocumentUseCase**(`parsers`): `ParseDocumentUseCase`

Defined in: application/usecase/ParseDocumentUseCase.ts:11

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`ParseDocumentUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`): `object`

Defined in: application/usecase/ParseDocumentUseCase.ts:19

ソーステキストとファイル拡張子からドキュメントを解析し、GridDataDto を生成します。

#### Parameters

##### text

`string`

ソーステキスト文字列

##### fileExtension

`string`

ファイル拡張子（例: "json", "yaml"）

#### Returns

`object`

生成された DTO と内部のドキュメントインスタンス

##### doc?

> `optional` **doc?**: [`StructuredDocument`](../../../../domain/model/StructuredDocument/classes/StructuredDocument.md)

##### dto

> **dto**: [`GridDataDto`](../../../dto/GridData/interfaces/GridDataDto.md)
