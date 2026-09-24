[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / DeleteRowUseCase

# Class: DeleteRowUseCase

Defined in: application/usecase/RowModificationUseCases.ts:94

指定されたパスのノード（行／要素）を削除するユースケース。

## Constructors

### Constructor

> **new DeleteRowUseCase**(`parsers`): `DeleteRowUseCase`

Defined in: application/usecase/RowModificationUseCases.ts:95

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`DeleteRowUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `pathStr`): `string`

Defined in: application/usecase/RowModificationUseCases.ts:104

行の削除を実行します。

#### Parameters

##### text

`string`

元のファイルテキスト

##### fileExtension

`string`

ファイル拡張子

##### pathStr

`string`

削除対象ノードのパス文字列

#### Returns

`string`

更新・シリアライズされたテキスト
