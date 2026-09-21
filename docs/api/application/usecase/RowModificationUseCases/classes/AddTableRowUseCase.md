[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / AddTableRowUseCase

# Class: AddTableRowUseCase

Defined in: application/usecase/RowModificationUseCases.ts:38

テーブルビュー（配列）に新しいデータ行を追加するユースケース。

## Constructors

### Constructor

> **new AddTableRowUseCase**(`parsers`): `AddTableRowUseCase`

Defined in: application/usecase/RowModificationUseCases.ts:39

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`AddTableRowUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr?`, `newRowData?`): `string`

Defined in: application/usecase/RowModificationUseCases.ts:49

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

#### Returns

`string`

更新・シリアライズされたテキスト
