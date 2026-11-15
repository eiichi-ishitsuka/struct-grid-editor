[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / AddTableColumnUseCase

# Class: AddTableColumnUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:81](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L81)

テーブルビュー（オブジェクト配列）に新しいカラム（プロパティ）を追加するユースケース。

## Constructors

### Constructor

> **new AddTableColumnUseCase**(`parsers`): `AddTableColumnUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:82](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L82)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`AddTableColumnUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr?`, `columnKey?`, `options?`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:93](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L93)

テーブルカラムの追加を実行します。

#### Parameters

##### text

`string`

元のファイルテキスト

##### fileExtension

`string`

ファイル拡張子

##### arrayPathStr?

`string` = `''`

対象配列のパス文字列

##### columnKey?

`string` = `'newColumn'`

追加するカラムキー名

##### options?

[`DocumentParseOptions`](../../../../domain/port/IDocumentParser/interfaces/DocumentParseOptions.md)

解析オプション

#### Returns

`string`

更新・シリアライズされたテキスト
