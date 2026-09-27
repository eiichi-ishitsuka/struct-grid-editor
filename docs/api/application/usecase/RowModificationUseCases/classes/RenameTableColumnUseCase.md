[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / RenameTableColumnUseCase

# Class: RenameTableColumnUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:121](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L121)

テーブルビューのカラム名を変更するユースケース。

## Constructors

### Constructor

> **new RenameTableColumnUseCase**(`parsers`): `RenameTableColumnUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:122](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L122)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`RenameTableColumnUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr`, `oldKey`, `newKey`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:133](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L133)

カラム名の変更を実行します。

#### Parameters

##### text

`string`

元のファイルテキスト

##### fileExtension

`string`

ファイル拡張子

##### arrayPathStr

`string`

対象配列のパス文字列

##### oldKey

`string`

変更元のカラム名

##### newKey

`string`

変更後の新しいカラム名

#### Returns

`string`

更新・シリアライズされたテキスト
