[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/dto/GridData](../README.md) / GridDataDto

# Interface: GridDataDto

Defined in: application/dto/GridData.ts:106

Webview に渡されるグリッド全体のデータ DTO。

## Properties

### documentType

> **documentType**: `"json"` \| `"yaml"`

Defined in: application/dto/GridData.ts:108

ドキュメント形式 ('json' または 'yaml')

***

### error?

> `optional` **error?**: `string`

Defined in: application/dto/GridData.ts:120

解析エラー等のメッセージ（存在する場合）

***

### rows

> **rows**: [`GridRowDto`](GridRowDto.md)[]

Defined in: application/dto/GridData.ts:112

Key-Value 表示時の行リスト

***

### subArrays?

> `optional` **subArrays?**: [`SubArrayInfoDto`](SubArrayInfoDto.md)[]

Defined in: application/dto/GridData.ts:118

ドキュメント内のサブ配列一覧

***

### tableData?

> `optional` **tableData?**: [`TableViewDto`](TableViewDto.md)

Defined in: application/dto/GridData.ts:116

テーブルビュー表示時のデータ

***

### totalRows

> **totalRows**: `number`

Defined in: application/dto/GridData.ts:114

総行数

***

### viewMode

> **viewMode**: `"table"` \| `"kv"`

Defined in: application/dto/GridData.ts:110

現在の表示モード ('table' または 'kv')
