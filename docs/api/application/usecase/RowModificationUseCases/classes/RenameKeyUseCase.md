[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / RenameKeyUseCase

# Class: RenameKeyUseCase

Defined in: application/usecase/RowModificationUseCases.ts:156

オブジェクト内のプロパティキー名を変更するユースケース。

## Constructors

### Constructor

> **new RenameKeyUseCase**(`parsers`): `RenameKeyUseCase`

Defined in: application/usecase/RowModificationUseCases.ts:157

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`RenameKeyUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `pathStr`, `newKey`): `string`

Defined in: application/usecase/RowModificationUseCases.ts:167

キー名の変更を実行します。

#### Parameters

##### text

`string`

元のファイルテキスト

##### fileExtension

`string`

ファイル拡張子

##### pathStr

`string`

対象ノードのパス文字列

##### newKey

`string`

新しいキー名

#### Returns

`string`

更新・シリアライズされたテキスト
