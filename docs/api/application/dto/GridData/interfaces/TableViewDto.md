[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/dto/GridData](../README.md) / TableViewDto

# Interface: TableViewDto

Defined in: application/dto/GridData.ts:44

テーブルビュー全体のデータ DTO。

## Properties

### columns

> **columns**: [`TableColumnDto`](TableColumnDto.md)[]

Defined in: application/dto/GridData.ts:48

カラム定義リスト

***

### isObjectArray

> **isObjectArray**: `boolean`

Defined in: application/dto/GridData.ts:56

オブジェクト配列であるか（false の場合はプリミティブ配列）

***

### path

> **path**: `string`

Defined in: application/dto/GridData.ts:46

テーブルの基点となる配列のパス

***

### rows

> **rows**: [`TableRowDto`](TableRowDto.md)[]

Defined in: application/dto/GridData.ts:50

行データリスト

***

### totalColumns

> **totalColumns**: `number`

Defined in: application/dto/GridData.ts:54

総カラム数

***

### totalRows

> **totalRows**: `number`

Defined in: application/dto/GridData.ts:52

総行数
