[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/usecase/UpdateCellUseCase](../README.md) / UpdateCellUseCase

# Class: UpdateCellUseCase

Defined in: [application/usecase/UpdateCellUseCase.ts:8](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/UpdateCellUseCase.ts#L8)

指定されたパスのセル値を更新し、元の書式を保持したままシリアライズされたテキストを生成するユースケース。

## Constructors

### Constructor

> **new UpdateCellUseCase**(`parsers`): `UpdateCellUseCase`

Defined in: [application/usecase/UpdateCellUseCase.ts:9](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/UpdateCellUseCase.ts#L9)

#### Parameters

##### parsers

[`IDocumentParser`](../../../../domain/port/IDocumentParser/interfaces/IDocumentParser.md)[]

#### Returns

`UpdateCellUseCase`

## Methods

### execute()

> **execute**(`text`, `fileExtension`, `pathStr`, `rawValue`, `options?`): `string`

Defined in: [application/usecase/UpdateCellUseCase.ts:20](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/application/usecase/UpdateCellUseCase.ts#L20)

セル値の更新を実行します。

#### Parameters

##### text

`string`

元のファイルテキスト

##### fileExtension

`string`

ファイル拡張子（例: "json", "yaml", "csv", "tsv"）

##### pathStr

`string`

更新対象セルのアクセスパス文字列

##### rawValue

`string`

ユーザーが入力した新しい値の文字列

##### options?

[`DocumentParseOptions`](../../../../domain/port/IDocumentParser/interfaces/DocumentParseOptions.md)

解析オプション（CSV/TSV のヘッダー有無等）

#### Returns

`string`

更新・シリアライズされたテキスト
