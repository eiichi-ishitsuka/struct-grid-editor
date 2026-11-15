[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / AddRowUseCase

# Class: AddRowUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:8](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L8)

オブジェクトまたは配列の指定親パス下に新規ノード（行／要素）を追加するユースケース。

## Constructors

### Constructor

> **new AddRowUseCase**(`parsers`): `AddRowUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:9](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L9)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`AddRowUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `parentPathStr?`, `key?`, `initialVal?`, `options?`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:21](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L21)

新規行の追加を実行します。

#### Parameters

##### text

`string`

元のファイルテキスト

##### fileExtension

`string`

ファイル拡張子

##### parentPathStr?

`string` = `''`

追加先親ノードのパス文字列

##### key?

`string` = `'newKey'`

新しいキー名

##### initialVal?

`any` = `''`

初期値

##### options?

[`DocumentParseOptions`](../../../../domain/port/IDocumentParser/interfaces/DocumentParseOptions.md)

解析オプション

#### Returns

`string`

更新・シリアライズされたテキスト
