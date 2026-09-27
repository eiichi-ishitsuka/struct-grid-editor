[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / MoveTableColumnUseCase

# Class: MoveTableColumnUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:224](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L224)

テーブルビュー内のカラム順序を並び替えるユースケース。

## Constructors

### Constructor

> **new MoveTableColumnUseCase**(`parsers`): `MoveTableColumnUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:225](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L225)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`MoveTableColumnUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr`, `fromIndex`, `toIndex`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:236](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L236)

カラムの並び替えを実行します。

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

移動元カラムインデックス

##### toIndex

`number`

移動先カラムインデックス

#### Returns

`string`

更新・シリアライズされたテキスト
