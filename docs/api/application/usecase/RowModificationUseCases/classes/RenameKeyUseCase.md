[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / RenameKeyUseCase

# Class: RenameKeyUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:186](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L186)

オブジェクト内のプロパティキー名を変更するユースケース。

## Constructors

### Constructor

> **new RenameKeyUseCase**(`parsers`): `RenameKeyUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:187](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L187)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`RenameKeyUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `pathStr`, `newKey`, `options?`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:198](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L198)

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

##### options?

[`DocumentParseOptions`](../../../../domain/port/IDocumentParser/interfaces/DocumentParseOptions.md)

解析オプション

#### Returns

`string`

更新・シリアライズされたテキスト
