[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/dto/GridData](../README.md) / GridDataDto

# Interface: GridDataDto

Defined in: [application/dto/GridData.ts:106](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L106)

Webview に渡されるグリッド全体のデータ DTO。

## Properties

### documentType

> **documentType**: `"json"` \| `"yaml"` \| `"jsonl"`

Defined in: [application/dto/GridData.ts:108](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L108)

ドキュメント形式 ('json', 'yaml' または 'jsonl')

***

### error?

> `optional` **error?**: `string`

Defined in: [application/dto/GridData.ts:120](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L120)

解析エラー等のメッセージ（存在する場合）

***

### rows

> **rows**: [`GridRowDto`](GridRowDto.md)[]

Defined in: [application/dto/GridData.ts:112](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L112)

Key-Value 表示時の行リスト

***

### subArrays?

> `optional` **subArrays?**: [`SubArrayInfoDto`](SubArrayInfoDto.md)[]

Defined in: [application/dto/GridData.ts:118](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L118)

ドキュメント内のサブ配列一覧

***

### tableData?

> `optional` **tableData?**: [`TableViewDto`](TableViewDto.md)

Defined in: [application/dto/GridData.ts:116](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L116)

テーブルビュー表示時のデータ

***

### totalRows

> **totalRows**: `number`

Defined in: [application/dto/GridData.ts:114](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L114)

総行数

***

### viewMode

> **viewMode**: `"table"` \| `"kv"`

Defined in: [application/dto/GridData.ts:110](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L110)

現在の表示モード ('table' または 'kv')
