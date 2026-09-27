[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / ClearTableColumnUseCase

# Class: ClearTableColumnUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:259](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L259)

テーブルビュー内の指定カラムの値を全行クリア（空文字化）するユースケース。

## Constructors

### Constructor

> **new ClearTableColumnUseCase**(`parsers`): `ClearTableColumnUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:260](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L260)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`ClearTableColumnUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr`, `columnKey`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:270](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/usecase/RowModificationUseCases.ts#L270)

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

#### Returns

`string`

更新・シリアライズされたテキスト
