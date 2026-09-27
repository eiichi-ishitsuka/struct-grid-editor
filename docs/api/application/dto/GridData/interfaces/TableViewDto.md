[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/dto/GridData](../README.md) / TableViewDto

# Interface: TableViewDto

Defined in: [application/dto/GridData.ts:44](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L44)

テーブルビュー全体のデータ DTO。

## Properties

### columns

> **columns**: [`TableColumnDto`](TableColumnDto.md)[]

Defined in: [application/dto/GridData.ts:48](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L48)

カラム定義リスト

***

### isObjectArray

> **isObjectArray**: `boolean`

Defined in: [application/dto/GridData.ts:56](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L56)

オブジェクト配列であるか（false の場合はプリミティブ配列）

***

### path

> **path**: `string`

Defined in: [application/dto/GridData.ts:46](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L46)

テーブルの基点となる配列のパス

***

### rows

> **rows**: [`TableRowDto`](TableRowDto.md)[]

Defined in: [application/dto/GridData.ts:50](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L50)

行データリスト

***

### totalColumns

> **totalColumns**: `number`

Defined in: [application/dto/GridData.ts:54](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L54)

総カラム数

***

### totalRows

> **totalRows**: `number`

Defined in: [application/dto/GridData.ts:52](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L52)

総行数
