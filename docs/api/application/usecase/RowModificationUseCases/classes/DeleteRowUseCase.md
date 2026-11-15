[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / DeleteRowUseCase

# Class: DeleteRowUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:116](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L116)

指定されたパスのノード（行／要素）を削除するユースケース。

## Constructors

### Constructor

> **new DeleteRowUseCase**(`parsers`): `DeleteRowUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:117](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L117)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`DeleteRowUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `pathStr`, `options?`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:127](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L127)

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

##### options?

[`DocumentParseOptions`](../../../../domain/port/IDocumentParser/interfaces/DocumentParseOptions.md)

解析オプション

#### Returns

`string`

更新・シリアライズされたテキスト
