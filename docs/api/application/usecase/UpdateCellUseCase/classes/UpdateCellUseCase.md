[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/UpdateCellUseCase](../README.md) / UpdateCellUseCase

# Class: UpdateCellUseCase

Defined in: application/usecase/UpdateCellUseCase.ts:8

指定されたパスのセル値を更新し、元の書式を保持したままシリアライズされたテキストを生成するユースケース。

## Constructors

### Constructor

> **new UpdateCellUseCase**(`parsers`): `UpdateCellUseCase`

Defined in: application/usecase/UpdateCellUseCase.ts:9

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`UpdateCellUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `pathStr`, `rawValue`): `string`

Defined in: application/usecase/UpdateCellUseCase.ts:19

セル値の更新を実行します。

#### Parameters

##### text

`string`

元のファイルテキスト

##### fileExtension

`string`

ファイル拡張子（例: "json", "yaml"）

##### pathStr

`string`

更新対象セルのアクセスパス文字列

##### rawValue

`string`

ユーザーが入力した新しい値の文字列

#### Returns

`string`

更新・シリアライズされたテキスト
