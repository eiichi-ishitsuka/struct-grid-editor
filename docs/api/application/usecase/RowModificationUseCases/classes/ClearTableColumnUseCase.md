[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / ClearTableColumnUseCase

# Class: ClearTableColumnUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:295](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/RowModificationUseCases.ts#L295)

テーブルビュー内の指定カラムの値を全行クリア（空文字化）するユースケース。

## Constructors

### Constructor

> **new ClearTableColumnUseCase**(`parsers`): `ClearTableColumnUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:296](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/RowModificationUseCases.ts#L296)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`ClearTableColumnUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr`, `columnKey`, `options?`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:307](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/RowModificationUseCases.ts#L307)

カラム値のクリアを実行します。

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

##### columnKey

`string`

対象のカラムキー名

##### options?

[`DocumentParseOptions`](../../../../domain/port/IDocumentParser/interfaces/DocumentParseOptions.md)

解析オプション

#### Returns

`string`

更新・シリアライズされたテキスト
