[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / MoveTableRowUseCase

# Class: MoveTableRowUseCase

Defined in: application/usecase/RowModificationUseCases.ts:189

テーブルビュー内の行を並び替えるユースケース。

## Constructors

### Constructor

> **new MoveTableRowUseCase**(`parsers`): `MoveTableRowUseCase`

Defined in: application/usecase/RowModificationUseCases.ts:190

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`MoveTableRowUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr`, `fromIndex`, `toIndex`): `string`

Defined in: application/usecase/RowModificationUseCases.ts:201

行の並び替えを実行します。

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

##### fromIndex

`number`

移動元インデックス

##### toIndex

`number`

移動先インデックス

#### Returns

`string`

更新・シリアライズされたテキスト
