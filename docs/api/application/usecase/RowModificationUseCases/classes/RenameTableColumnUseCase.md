[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / RenameTableColumnUseCase

# Class: RenameTableColumnUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:149](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/RowModificationUseCases.ts#L149)

テーブルビューのカラム名を変更するユースケース。

## Constructors

### Constructor

> **new RenameTableColumnUseCase**(`parsers`): `RenameTableColumnUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:150](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/RowModificationUseCases.ts#L150)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`RenameTableColumnUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr`, `oldKey`, `newKey`, `options?`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:162](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/RowModificationUseCases.ts#L162)

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

##### options?

[`DocumentParseOptions`](../../../../domain/port/IDocumentParser/interfaces/DocumentParseOptions.md)

解析オプション

#### Returns

`string`

更新・シリアライズされたテキスト
