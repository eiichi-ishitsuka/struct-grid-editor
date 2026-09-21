[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / AddTableColumnUseCase

# Class: AddTableColumnUseCase

Defined in: application/usecase/RowModificationUseCases.ts:66

テーブルビュー（オブジェクト配列）に新しいカラム（プロパティ）を追加するユースケース。

## Constructors

### Constructor

> **new AddTableColumnUseCase**(`parsers`): `AddTableColumnUseCase`

Defined in: application/usecase/RowModificationUseCases.ts:67

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`AddTableColumnUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr?`, `columnKey?`): `string`

Defined in: application/usecase/RowModificationUseCases.ts:77

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

#### Returns

`string`

更新・シリアライズされたテキスト
