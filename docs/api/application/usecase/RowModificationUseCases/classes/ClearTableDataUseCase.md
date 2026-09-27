[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / ClearTableDataUseCase

# Class: ClearTableDataUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:292](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L292)

テーブルビュー内の全データセルの値を全クリアするユースケース。

## Constructors

### Constructor

> **new ClearTableDataUseCase**(`parsers`): `ClearTableDataUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:293](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L293)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`ClearTableDataUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:302](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L302)

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

#### Returns

`string`

更新・シリアライズされたテキスト
