[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / DeleteRowUseCase

# Class: DeleteRowUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:94](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L94)

指定されたパスのノード（行／要素）を削除するユースケース。

## Constructors

### Constructor

> **new DeleteRowUseCase**(`parsers`): `DeleteRowUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:95](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L95)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`DeleteRowUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `pathStr`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:104](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L104)

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
