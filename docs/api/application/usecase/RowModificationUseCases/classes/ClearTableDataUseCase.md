[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / ClearTableDataUseCase

# Class: ClearTableDataUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:330](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/RowModificationUseCases.ts#L330)

テーブルビュー内の全データセルの値を全クリアするユースケース。

## Constructors

### Constructor

> **new ClearTableDataUseCase**(`parsers`): `ClearTableDataUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:331](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/RowModificationUseCases.ts#L331)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`ClearTableDataUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr`, `options?`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:341](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/RowModificationUseCases.ts#L341)

テーブル全セルのクリアを実行します。

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

##### options?

[`DocumentParseOptions`](../../../../domain/port/IDocumentParser/interfaces/DocumentParseOptions.md)

解析オプション

#### Returns

`string`

更新・シリアライズされたテキスト
