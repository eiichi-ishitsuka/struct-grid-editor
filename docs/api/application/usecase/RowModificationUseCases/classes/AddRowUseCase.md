[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / AddRowUseCase

# Class: AddRowUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:8](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/e20beb86538f08849d50b688bca0eb17506d34aa/src/application/usecase/RowModificationUseCases.ts#L8)

オブジェクトまたは配列の指定親パス下に新規ノード（行／要素）を追加するユースケース。

## Constructors

### Constructor

> **new AddRowUseCase**(`parsers`): `AddRowUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:9](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/e20beb86538f08849d50b688bca0eb17506d34aa/src/application/usecase/RowModificationUseCases.ts#L9)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`AddRowUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `parentPathStr?`, `key?`, `initialVal?`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:20](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/e20beb86538f08849d50b688bca0eb17506d34aa/src/application/usecase/RowModificationUseCases.ts#L20)

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

#### Returns

`string`

更新・シリアライズされたテキスト
