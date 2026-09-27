[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/model/tableView](../README.md) / OrderedTableView

# Interface: OrderedTableView

Defined in: [webview/model/tableView.ts:21](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/model/tableView.ts#L21)

## Extends

- `Omit`\<[`TableViewDto`](../../../../application/dto/GridData/interfaces/TableViewDto.md), `"columns"` \| `"rows"`\>

## Properties

### allColumns

> **allColumns**: [`TableColumnDto`](../../../../application/dto/GridData/interfaces/TableColumnDto.md)[]

Defined in: [webview/model/tableView.ts:23](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/model/tableView.ts#L23)

***

### columns

> **columns**: [`TableColumnDto`](../../../../application/dto/GridData/interfaces/TableColumnDto.md)[]

Defined in: [webview/model/tableView.ts:22](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/model/tableView.ts#L22)

***

### isObjectArray

> **isObjectArray**: `boolean`

Defined in: [application/dto/GridData.ts:56](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L56)

オブジェクト配列であるか（false の場合はプリミティブ配列）

#### Inherited from

[`TableViewDto`](../../../../application/dto/GridData/interfaces/TableViewDto.md).[`isObjectArray`](../../../../application/dto/GridData/interfaces/TableViewDto.md#isobjectarray)

***

### path

> **path**: `string`

Defined in: [application/dto/GridData.ts:46](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L46)

テーブルの基点となる配列のパス

#### Inherited from

[`TableViewDto`](../../../../application/dto/GridData/interfaces/TableViewDto.md).[`path`](../../../../application/dto/GridData/interfaces/TableViewDto.md#path)

***

### rows

> **rows**: [`TableRowDto`](../../../../application/dto/GridData/interfaces/TableRowDto.md)[]

Defined in: [webview/model/tableView.ts:24](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/model/tableView.ts#L24)

***

### totalColumns

> **totalColumns**: `number`

Defined in: [application/dto/GridData.ts:54](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L54)

総カラム数

#### Inherited from

[`TableViewDto`](../../../../application/dto/GridData/interfaces/TableViewDto.md).[`totalColumns`](../../../../application/dto/GridData/interfaces/TableViewDto.md#totalcolumns)

***

### totalRows

> **totalRows**: `number`

Defined in: [application/dto/GridData.ts:52](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L52)

総行数

#### Inherited from

[`TableViewDto`](../../../../application/dto/GridData/interfaces/TableViewDto.md).[`totalRows`](../../../../application/dto/GridData/interfaces/TableViewDto.md#totalrows)
