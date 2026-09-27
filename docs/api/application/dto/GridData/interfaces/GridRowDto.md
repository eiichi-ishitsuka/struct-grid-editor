[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [application/dto/GridData](../README.md) / GridRowDto

# Interface: GridRowDto

Defined in: [application/dto/GridData.ts:78](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L78)

スプレッドシート／Key-Value グリッド描画用に Webview へ渡される行データ DTO。

## Properties

### arrayLength?

> `optional` **arrayLength?**: `number`

Defined in: [application/dto/GridData.ts:98](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L98)

配列の場合の要素数

***

### depth

> **depth**: `number`

Defined in: [application/dto/GridData.ts:92](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L92)

階層の深さ（0起点）

***

### displayValue

> **displayValue**: `string`

Defined in: [application/dto/GridData.ts:88](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L88)

UI表示用の整形済み文字列

***

### id

> **id**: `string`

Defined in: [application/dto/GridData.ts:80](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L80)

行の一意識別子

***

### isArray?

> `optional` **isArray?**: `boolean`

Defined in: [application/dto/GridData.ts:96](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L96)

配列ノードであるかどうか

***

### isLeaf

> **isLeaf**: `boolean`

Defined in: [application/dto/GridData.ts:94](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L94)

末端の値（リーフ）であるかどうか

***

### key

> **key**: `string`

Defined in: [application/dto/GridData.ts:84](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L84)

プロパティ名またはインデックス

***

### path

> **path**: `string`

Defined in: [application/dto/GridData.ts:82](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L82)

ノードへのアクセスパス（例: "users[0].name"）

***

### subArrayPath?

> `optional` **subArrayPath?**: `string`

Defined in: [application/dto/GridData.ts:100](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L100)

サブ配列へのドリルダウンパス

***

### type

> **type**: `string`

Defined in: [application/dto/GridData.ts:90](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L90)

データ型

***

### value

> **value**: `any`

Defined in: [application/dto/GridData.ts:86](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/application/dto/GridData.ts#L86)

生の値
