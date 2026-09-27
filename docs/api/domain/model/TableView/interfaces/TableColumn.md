[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/TableView](../README.md) / TableColumn

# Interface: TableColumn

Defined in: [domain/model/TableView.ts:8](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/TableView.ts#L8)

テーブルビューのカラム定義。

## Properties

### key

> **key**: `string`

Defined in: [domain/model/TableView.ts:10](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/TableView.ts#L10)

カラムの識別キー（プロパティ名等）

***

### label

> **label**: `string`

Defined in: [domain/model/TableView.ts:12](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/TableView.ts#L12)

カラムの表示名

***

### type

> **type**: `"string"` \| `"number"` \| `"boolean"` \| `"object"` \| `"array"` \| `"other"`

Defined in: [domain/model/TableView.ts:14](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/TableView.ts#L14)

カラムのデータ型

***

### typeSymbol

> **typeSymbol**: `string`

Defined in: [domain/model/TableView.ts:16](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/TableView.ts#L16)

ヘッダー等に表示する型シンボル（例: "1234", "Aa", "[ ]" 等）
