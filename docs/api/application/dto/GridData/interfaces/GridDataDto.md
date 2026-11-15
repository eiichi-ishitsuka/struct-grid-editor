[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/dto/GridData](../README.md) / GridDataDto

# Interface: GridDataDto

Defined in: [application/dto/GridData.ts:106](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/dto/GridData.ts#L106)

Webview に渡されるグリッド全体のデータ DTO。

## Properties

### documentType

> **documentType**: `"json"` \| `"yaml"` \| `"jsonl"` \| `"csv"` \| `"tsv"`

Defined in: [application/dto/GridData.ts:108](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/dto/GridData.ts#L108)

ドキュメント形式 ('json', 'yaml', 'jsonl', 'csv' または 'tsv')

***

### error?

> `optional` **error?**: `string`

Defined in: [application/dto/GridData.ts:122](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/dto/GridData.ts#L122)

解析エラー等のメッセージ（存在する場合）

***

### hasHeader?

> `optional` **hasHeader?**: `boolean`

Defined in: [application/dto/GridData.ts:120](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/dto/GridData.ts#L120)

CSV/TSV の場合に1行目をヘッダーとして扱っているかどうか

***

### rows

> **rows**: [`GridRowDto`](GridRowDto.md)[]

Defined in: [application/dto/GridData.ts:112](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/dto/GridData.ts#L112)

Key-Value 表示時の行リスト

***

### subArrays?

> `optional` **subArrays?**: [`SubArrayInfoDto`](SubArrayInfoDto.md)[]

Defined in: [application/dto/GridData.ts:118](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/dto/GridData.ts#L118)

ドキュメント内のサブ配列一覧

***

### tableData?

> `optional` **tableData?**: [`TableViewDto`](TableViewDto.md)

Defined in: [application/dto/GridData.ts:116](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/dto/GridData.ts#L116)

テーブルビュー表示時のデータ

***

### totalRows

> **totalRows**: `number`

Defined in: [application/dto/GridData.ts:114](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/dto/GridData.ts#L114)

総行数

***

### viewMode

> **viewMode**: `"table"` \| `"kv"`

Defined in: [application/dto/GridData.ts:110](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/application/dto/GridData.ts#L110)

現在の表示モード ('table' または 'kv')
