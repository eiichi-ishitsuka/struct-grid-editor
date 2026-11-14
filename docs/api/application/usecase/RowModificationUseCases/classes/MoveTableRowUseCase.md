[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/RowModificationUseCases](../README.md) / MoveTableRowUseCase

# Class: MoveTableRowUseCase

Defined in: [application/usecase/RowModificationUseCases.ts:221](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/RowModificationUseCases.ts#L221)

テーブルビュー内の行を並び替えるユースケース。

## Constructors

### Constructor

> **new MoveTableRowUseCase**(`parsers`): `MoveTableRowUseCase`

Defined in: [application/usecase/RowModificationUseCases.ts:222](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/RowModificationUseCases.ts#L222)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`MoveTableRowUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `arrayPathStr`, `fromIndex`, `toIndex`, `options?`): `string`

Defined in: [application/usecase/RowModificationUseCases.ts:234](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/RowModificationUseCases.ts#L234)

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

##### options?

[`DocumentParseOptions`](../../../../domain/port/IDocumentParser/interfaces/DocumentParseOptions.md)

解析オプション

#### Returns

`string`

更新・シリアライズされたテキスト
