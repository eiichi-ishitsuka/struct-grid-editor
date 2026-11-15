[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / AddTableRowUseCase

# Class: AddTableRowUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:46](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L46)

テーブルビュー（配列）に新しいデータ行を追加するユースケース。

## Constructors

### Constructor

> **new AddTableRowUseCase**(`parsers`): `AddTableRowUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:47](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L47)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`AddTableRowUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr?`, `newRowData?`, `options?`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:58](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/usecase/RowModificationUseCases.ts#L58)

テーブル行の追加を実行します。

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

##### newRowData?

`any`

追加する行データ（省略時は自動推論）

##### options?

[`DocumentParseOptions`](../../../../domain/port/IDocumentParser/interfaces/DocumentParseOptions.md)

解析オプション

#### Returns

`string`

更新・シリアライズされたテキスト
